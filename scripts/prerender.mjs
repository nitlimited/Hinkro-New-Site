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
  [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].find((candidate) => existsSync(candidate));

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

async function createPrerenderPage(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const requestUrl = request.url();
    if (
      requestUrl.startsWith(baseUrl) ||
      requestUrl.startsWith("data:") ||
      requestUrl.startsWith("blob:")
    ) {
      request.continue();
      return;
    }
    request.abort();
  });
  return page;
}

async function main() {
  const puppeteer = await import("puppeteer");
  if (!CHROME_PATH) throw new Error("Chromium is required for SEO prerendering.");

  const server = createServer(serveStatic);
  const port = 14723;
  await new Promise((r) => server.listen(port, r));
  console.log(`Static server on http://localhost:${port}`);

  let success = 0;
  const failures = [];
  const baseUrl = `http://localhost:${port}`;

  const launchOpts = {
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  };
  let browser;
  try {
    browser = await puppeteer.default.launch(launchOpts);
  } catch (error) {
    server.close();
    throw error;
  }
  let page = await createPrerenderPage(browser, baseUrl);

  for (let i = 0; i < allRoutes.length; i++) {
    const route = allRoutes[i];
    let routeError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const url = `${baseUrl}${route}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForSelector('html[data-seo-ready="true"]', { timeout: 10000 });
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        const html = await page.content();
        const outPath = join(DIST, route === "/" ? "index.html" : join(route.slice(1), "index.html"));
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, html, "utf-8");
        success++;
        routeError = null;
        process.stdout.write(`  ✓ [${i + 1}/${allRoutes.length}] ${route}\n`);
        break;
      } catch (error) {
        routeError = error;
        if (attempt < 3) {
          process.stdout.write(`  ↻ [${i + 1}/${allRoutes.length}] ${route} retry ${attempt}\n`);
          await page.close().catch(() => {});
          page = await createPrerenderPage(browser, baseUrl);
        }
      }
    }
    if (routeError) {
      failures.push({ route, message: routeError.message });
      process.stdout.write(`  ✗ [${i + 1}/${allRoutes.length}] ${route} — ${routeError.message.slice(0, 80)}\n`);
    }
  }

  await page.close();
  await browser.close();
  server.close();
  console.log(`\nDone: ${success} rendered, ${failures.length} failed out of ${allRoutes.length} routes`);
  if (failures.length > 0) {
    throw new Error(`SEO prerendering failed for ${failures.map(({ route }) => route).join(", ")}`);
  }
}

main().catch((err) => {
  console.error("\n[prerender] FAILED — refusing to deploy incomplete SEO output.");
  console.error(err);
  process.exitCode = 1;
});
