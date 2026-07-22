#!/usr/bin/env node

import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { allRoutes } from "./routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Route list lives in scripts/routes.mjs (shared with the sitemap generator).

function serveStatic(req, res) {
  let url = req.url.split("?")[0];
  let filePath = join(DIST, url);
  if (existsSync(filePath) && !filePath.endsWith(".html")) {
    if (existsSync(join(filePath, "index.html"))) {
      filePath = join(filePath, "index.html");
    }
  }
  if (!existsSync(filePath)) {
    filePath = join(DIST, "index.html");
  }
  try {
    const data = readFileSync(filePath);
    const ext = filePath.split(".").pop().toLowerCase();
    const mimeTypes = {
      html: "text/html",
      js: "application/javascript",
      mjs: "application/javascript",
      css: "text/css",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      mp4: "video/mp4",
      webm: "video/webm",
      ico: "image/x-icon",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function renderRoute(page, baseUrl, route, retries = 2) {
  const url = `${baseUrl}${route}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 500));
      const html = await page.content();
      const outPath = join(DIST, route === "/" ? "index.html" : join(route.slice(1), "index.html"));
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html, "utf-8");
      return true;
    } catch (err) {
      if (attempt < retries) {
        await page.close().catch(() => {});
        return null;
      }
      throw err;
    }
  }
}

async function main() {
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    // Best-effort: the Vite build in dist/ is already valid and deployable.
    // Never fail the deploy just because prerendering can't run.
    console.warn(
      "\n[prerender] SKIPPED — puppeteer unavailable. The site will deploy as a\n" +
        "client-rendered SPA (no pre-rendered HTML for crawlers).\n" +
        "Fix with: npm install --save-dev puppeteer\n",
    );
    return;
  }

  const server = createServer(serveStatic);
  const port = 14723;
  await new Promise((r) => server.listen(port, r));
  console.log(`Static server on http://localhost:${port}`);

  let success = 0;
  let fail = 0;
  const baseUrl = `http://localhost:${port}`;

  const launchOpts = {
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  };
  let browser = await puppeteer.default.launch(launchOpts);

  for (let i = 0; i < allRoutes.length; i++) {
    const route = allRoutes[i];
    let page;
    try {
      if (!browser.connected) {
        process.stdout.write(`  ↻ Relaunching browser...\n`);
        browser = await puppeteer.default.launch(launchOpts);
      }
      page = await browser.newPage();
      const url = `${baseUrl}${route}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 500));
      const html = await page.content();
      const outPath = join(DIST, route === "/" ? "index.html" : join(route.slice(1), "index.html"));
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html, "utf-8");
      success++;
      process.stdout.write(`  ✓ [${i + 1}/${allRoutes.length}] ${route}\n`);
    } catch (err) {
      fail++;
      process.stdout.write(`  ✗ [${i + 1}/${allRoutes.length}] ${route} — ${err.message.slice(0, 80)}\n`);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  await browser.close();
  server.close();
  console.log(`\nDone: ${success} rendered, ${fail} failed out of ${allRoutes.length} routes`);
}

main().catch((err) => {
  // Prerendering is a progressive enhancement for SEO. If it fails (missing
  // Chromium, sandbox restrictions in a CI builder, a crashed page), we still
  // want the built site in dist/ to ship rather than blocking the deploy.
  console.error("\n[prerender] FAILED — deploying without pre-rendered HTML.");
  console.error(err);
});
