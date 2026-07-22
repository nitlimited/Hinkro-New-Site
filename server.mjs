import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(ROOT, "dist");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const MAX_JSON_BYTES = 16 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 20;
const routeManifestPath = join(DIST, "seo-routes.json");
const knownPublicRoutes = new Set(
  existsSync(routeManifestPath) ? JSON.parse(readFileSync(routeManifestPath, "utf8")) : ["/"],
);

const uploadTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webm", "video/webm"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
  // Browsers only apply a sitemap stylesheet when it's served as XSL.
  [".xsl", "text/xsl; charset=utf-8"],
]);

const fixedRedirects = new Map([
  ["/the-dansinkran-kente/", "/blog/dansinkran-kente-wrapped-kente-cloth/"],
  ["/slideshow-of-kente-cloth-patterns/", "/blog/kente-cloth-colors/"],
  ["/checkout/", "/"],
  ["/cart/", "/"],
  ["/my-account/", "/"],
  ["/shop/", "/authentic-kente-fabric/"],
  ["/products/", "/authentic-kente-fabric/"],
  ["/categories/", "/"],
]);

const rateLimits = new Map();
let r2Client;

function setCommonHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function sendEmpty(res, status) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function rateLimitUpload(req, res) {
  const now = Date.now();
  const ip = clientIp(req);
  const current = rateLimits.get(ip);
  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  current.count += 1;
  if (current.count <= RATE_LIMIT_REQUESTS) return true;
  res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
  sendJson(res, 429, { error: "Too many upload requests. Please try again later." });
  return false;
}

function originAllowed(req) {
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.length === 0) return true;
  const origin = req.headers.origin;
  return Boolean(origin && configured.includes(origin));
}

async function readJson(req) {
  const declared = Number(req.headers["content-length"] || 0);
  if (declared > MAX_JSON_BYTES) throw Object.assign(new Error("Request body too large"), { status: 413 });

  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_JSON_BYTES) throw Object.assign(new Error("Request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  }
}

function getR2Config() {
  const config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET_NAME,
    publicUrl: String(process.env.R2_PUBLIC_URL || "").replace(/\/$/, ""),
  };
  if (Object.values(config).some((value) => !value)) {
    throw Object.assign(new Error("Upload service is not configured"), { status: 503 });
  }
  return config;
}

async function handleUpload(req, res) {
  if (!originAllowed(req)) return sendJson(res, 403, { error: "Origin not allowed" });
  if (!rateLimitUpload(req, res)) return;

  const { filename, contentType, size } = await readJson(req);
  const extension = uploadTypes.get(String(contentType || "").toLowerCase());
  const uploadSize = Number(size);
  if (!filename || typeof filename !== "string" || filename.length > 180 || !extension) {
    return sendJson(res, 400, { error: "Use a valid JPG, PNG, WebP, or GIF image." });
  }
  if (!Number.isInteger(uploadSize) || uploadSize <= 0 || uploadSize > MAX_UPLOAD_BYTES) {
    return sendJson(res, 400, { error: "File size must be between 1 byte and 10 MB." });
  }

  const config = getR2Config();
  r2Client ||= new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const day = new Date().toISOString().slice(0, 10);
  const key = `booking-refs/${day}/${randomUUID()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: uploadSize,
  });
  const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  return sendJson(res, 200, {
    presignedUrl,
    publicUrl: `${config.publicUrl}/${key}`,
    key,
  });
}

function redirectFor(pathname) {
  if (pathname === "/blog") return { status: 308, location: "/blog/" };
  const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const fixed = fixedRedirects.get(normalizedPath);
  if (fixed) return { status: 308, location: fixed };

  const dated = normalizedPath.match(/^\/([a-z0-9-]+)\/(\d+)\/(\d{2})\/(\d{2})\/$/);
  if (dated) {
    const slug = dated[1];
    const special = {
      "the-dansinkran-kente": "dansinkran-kente-wrapped-kente-cloth",
      "slideshow-of-kente-cloth-patterns": "kente-cloth-colors",
    }[slug];
    return { status: 308, location: `/blog/${special || slug}/` };
  }

  if (
    pathname !== "/" &&
    !pathname.endsWith("/") &&
    !extname(pathname) &&
    !pathname.startsWith("/portal")
  ) {
    if (knownPublicRoutes.has(`${pathname}/`)) {
      return { status: 308, location: `${pathname}/` };
    }
    const directory = safeStaticPath(`${pathname}/`);
    if (directory && existsSync(join(directory, "index.html"))) {
      return { status: 308, location: `${pathname}/` };
    }
  }
  return null;
}

function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relative = normalize(decoded).replace(/^[/\\]+/, "");
  const candidate = resolve(DIST, relative);
  if (candidate !== DIST && !candidate.startsWith(`${DIST}${sep}`)) return null;
  return candidate;
}

function resolveStaticFile(pathname) {
  const candidate = safeStaticPath(pathname);
  if (candidate && existsSync(candidate)) {
    const stat = statSync(candidate);
    if (stat.isFile()) return candidate;
    if (stat.isDirectory()) {
      const index = join(candidate, "index.html");
      if (existsSync(index)) return index;
    }
  }
  return null;
}

function cacheHeader(pathname, filePath) {
  if (pathname.startsWith("/assets/")) return "public, max-age=31536000, immutable";
  if (filePath.endsWith("index.html") || pathname === "/sw.js") return "no-cache";
  if (/\.(?:avif|gif|ico|jpe?g|mp4|png|svg|webm|webp|woff2?)$/i.test(filePath)) {
    return "public, max-age=604800";
  }
  return "public, max-age=3600";
}

function serveFile(req, res, pathname) {
  let filePath = resolveStaticFile(pathname);
  const isPortalRoute = pathname === "/portal" || pathname.startsWith("/portal/");
  const isKnownPublicRoute = knownPublicRoutes.has(pathname);
  const isNotFound = !filePath && !isPortalRoute && !isKnownPublicRoute;
  if (!filePath) filePath = join(DIST, "index.html");
  if (!existsSync(filePath)) return sendJson(res, 503, { error: "Application build is missing" });

  const stat = statSync(filePath);
  const contentType = mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", cacheHeader(pathname, filePath));
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt") {
    res.setHeader("X-Robots-Tag", "index, follow");
  }
  if (isNotFound) res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${stat.size}`);
      return res.end();
    }
    const start = match[1] ? Number(match[1]) : Math.max(0, stat.size - Number(match[2] || 0));
    const end = match[2] ? Number(match[2]) : stat.size - 1;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= stat.size) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${stat.size}`);
      return res.end();
    }
    const boundedEnd = Math.min(end, stat.size - 1);
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${boundedEnd}/${stat.size}`);
    res.setHeader("Content-Length", String(boundedEnd - start + 1));
    if (req.method === "HEAD") return res.end();
    return createReadStream(filePath, { start, end: boundedEnd }).pipe(res);
  }

  res.statusCode = isNotFound ? 404 : 200;
  res.setHeader("Content-Length", String(stat.size));
  if (req.method === "HEAD") return res.end();
  return createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  setCommonHeaders(res);
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname === "/api/health") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.setHeader("Allow", "GET, HEAD");
        return sendJson(res, 405, { error: "Method not allowed" });
      }
      if (req.method === "HEAD") return sendEmpty(res, 200);
      return sendJson(res, 200, { status: "ok" });
    }

    if (url.pathname === "/api/upload") {
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Method not allowed" });
      }
      return await handleUpload(req, res);
    }

    if (url.pathname.startsWith("/api/")) return sendJson(res, 404, { error: "Not found" });
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const redirect = redirectFor(url.pathname);
    if (redirect) {
      res.statusCode = redirect.status;
      res.setHeader("Location", redirect.location);
      return res.end();
    }
    return serveFile(req, res, url.pathname);
  } catch (error) {
    const status = Number(error?.status || 500);
    if (status >= 500) console.error("[server]", error);
    return sendJson(res, status, { error: status >= 500 ? "Request failed" : error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Hinkro listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`[server] received ${signal}, shutting down`);
  server.close((error) => {
    if (error) {
      console.error("[server] shutdown failed", error);
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
