#!/usr/bin/env node

/**
 * Builds a Yoast-style sitemap set:
 *
 *   /sitemap.xml            index -> the three below
 *   /sitemap-pages.xml      site pages
 *   /sitemap-blog.xml       blog posts
 *   /sitemap-products.xml   shop products
 *
 * Every file references /sitemap.xsl so browsers render a readable table
 * instead of "This XML file does not appear to have any style information".
 * Search engines ignore the stylesheet and read the XML as normal.
 *
 * Routes come from scripts/routes.mjs (shared with the prerenderer). Any
 * lastmod / changefreq / priority / image data already present in the existing
 * sitemap is carried over so we don't lose hand-tuned SEO values.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { allRoutes, indexableRoutes } from "./routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const ORIGIN = "https://hinkrokente.com";
const TODAY = new Date().toISOString().slice(0, 10);

/** Pull existing per-URL metadata so nothing hand-tuned is lost. */
function readExistingMeta() {
  const meta = new Map();
  const sitemapFiles = [
    "sitemap.xml",
    "sitemap-pages.xml",
    "sitemap-blog.xml",
    "sitemap-products.xml",
  ];

  for (const sitemapFile of sitemapFiles) {
    const file = join(PUBLIC, sitemapFile);
    if (!existsSync(file)) continue;
    const xml = readFileSync(file, "utf-8");
    for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) || []) {
      const loc = (block.match(/<loc>(.*?)<\/loc>/) || [])[1];
      if (!loc) continue;
      const path = loc.replace(ORIGIN, "").replace(/^https?:\/\/[^/]+/, "") || "/";
      const images = (block.match(/<image:image>[\s\S]*?<\/image:image>/g) || [])
        .join("\n      ")
        .replaceAll("https://www.hinkrokente.com", ORIGIN);
      meta.set(path, {
        lastmod: (block.match(/<lastmod>(.*?)<\/lastmod>/) || [])[1],
        changefreq: (block.match(/<changefreq>(.*?)<\/changefreq>/) || [])[1],
        priority: (block.match(/<priority>(.*?)<\/priority>/) || [])[1],
        images,
      });
    }
  }
  return meta;
}

/** Sensible defaults for routes not already in the sitemap. */
function defaultsFor(route) {
  if (route === "/") return { changefreq: "weekly", priority: "1.0" };
  if (route.startsWith("/blog/")) return { changefreq: "monthly", priority: "0.6" };
  if (route.startsWith("/product/")) return { changefreq: "weekly", priority: "0.7" };
  return { changefreq: "monthly", priority: "0.8" };
}

function urlEntry(route, meta) {
  const m = meta.get(route) || {};
  const d = defaultsFor(route);
  const parts = [
    "  <url>",
    `    <loc>${ORIGIN}${route}</loc>`,
    `    <lastmod>${m.lastmod || TODAY}</lastmod>`,
    `    <changefreq>${m.changefreq || d.changefreq}</changefreq>`,
    `    <priority>${m.priority || d.priority}</priority>`,
  ];
  if (m.images) parts.push(`    ${m.images}`);
  parts.push("  </url>");
  return parts.join("\n");
}

function urlset(routes, meta) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...routes.map((r) => urlEntry(r, meta)),
    "</urlset>",
    "",
  ].join("\n");
}

function sitemapIndex(children) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...children.map(
      (c) =>
        `  <sitemap>\n    <loc>${ORIGIN}/${c.file}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`,
    ),
    "</sitemapindex>",
    "",
  ].join("\n");
}

const meta = readExistingMeta();

const routes = [...new Set(indexableRoutes)].filter((route) => !route.startsWith("/portal"));

const groups = [
  {
    file: "sitemap-pages.xml",
    label: "Pages",
    routes: routes.filter((r) => !r.startsWith("/blog/") && !r.startsWith("/product/")),
  },
  {
    file: "sitemap-blog.xml",
    label: "Blog",
    routes: routes.filter((r) => r.startsWith("/blog/")),
  },
  {
    file: "sitemap-products.xml",
    label: "Products",
    routes: routes.filter((r) => r.startsWith("/product/")),
  },
];

const sortRoutes = (a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b));

for (const g of groups) {
  g.routes.sort(sortRoutes);
  writeFileSync(join(PUBLIC, g.file), urlset(g.routes, meta), "utf-8");
  console.log(`  ${g.label.padEnd(9)} ${String(g.routes.length).padStart(3)} urls -> ${g.file}`);
}

writeFileSync(join(PUBLIC, "sitemap.xml"), sitemapIndex(groups), "utf-8");
writeFileSync(join(PUBLIC, "seo-routes.json"), `${JSON.stringify(allRoutes, null, 2)}\n`, "utf-8");
console.log(`  Index      ${groups.length} sitemaps -> sitemap.xml`);
console.log(`\nTotal: ${groups.reduce((n, g) => n + g.routes.length, 0)} urls`);
