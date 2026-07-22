<?xml version="1.0" encoding="UTF-8"?>
<!--
  Presentation layer for the Hinkro Kente sitemaps.
  Browsers apply this stylesheet and render a readable table; search engines
  ignore it and read the raw XML. Handles both <sitemapindex> and <urlset>.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, follow"/>
        <title>Hinkro Kente — XML Sitemap</title>
        <style>
          :root {
            --navy: #0c2141;
            --gold: #cd8c23;
            --gold-bright: #f0a01f;
            --bone: #f6f1e8;
            --ink: #121212;
            --muted: #70695f;
            --line: #e5ddcf;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bone);
            color: var(--ink);
            font-family: Overpass, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            font-size: 15px;
            line-height: 1.6;
          }
          header {
            background: var(--navy);
            color: #fff;
            padding: 34px 24px 30px;
          }
          .wrap { max-width: 1100px; margin: 0 auto; }
          .eyebrow {
            margin: 0 0 6px;
            color: var(--gold-bright);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0 0 8px;
            font-family: "Cormorant Garamond", Georgia, serif;
            font-size: 34px;
            font-style: italic;
            font-weight: 500;
          }
          header p { margin: 0; color: rgba(255,255,255,0.72); font-size: 14px; max-width: 640px; }
          main { padding: 26px 24px 70px; }
          .stat-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
          .stat {
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 12px 18px;
          }
          .stat b {
            display: block;
            font-family: "Cormorant Garamond", Georgia, serif;
            font-size: 24px;
            color: var(--navy);
          }
          .stat span { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
          .card {
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 12px;
            overflow: hidden;
          }
          table { width: 100%; border-collapse: collapse; }
          th {
            background: #fbf8f1;
            color: var(--muted);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            text-align: left;
            padding: 12px 18px;
            border-bottom: 1px solid var(--line);
          }
          td { padding: 12px 18px; border-bottom: 1px solid #f1ece1; vertical-align: middle; }
          tr:last-child td { border-bottom: 0; }
          tr:hover td { background: #fbf8f1; }
          a { color: var(--navy); text-decoration: none; word-break: break-word; }
          a:hover { color: var(--gold); text-decoration: underline; }
          .num { color: var(--muted); font-variant-numeric: tabular-nums; width: 52px; }
          .meta { color: var(--muted); font-size: 13px; white-space: nowrap; }
          .pill {
            display: inline-block;
            background: #eef2f8;
            color: var(--navy);
            border-radius: 999px;
            padding: 3px 11px;
            font-size: 12px;
            font-weight: 700;
          }
          .pill.img { background: #fdf3e3; color: #8a5a0d; margin-left: 6px; }
          .note {
            margin: 22px 0 0;
            color: var(--muted);
            font-size: 13px;
          }
          @media (max-width: 640px) {
            h1 { font-size: 27px; }
            .hide-sm { display: none; }
            td, th { padding: 10px 12px; }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="wrap">
            <p class="eyebrow">Hinkro Kente</p>
            <h1>XML Sitemap</h1>
            <p>
              This file lists every public page so search engines can find and index them.
              It is generated automatically — you don't need to edit it by hand.
            </p>
          </div>
        </header>
        <main>
          <div class="wrap">
            <xsl:apply-templates select="s:sitemapindex"/>
            <xsl:apply-templates select="s:urlset"/>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>

  <!-- ============ Index view: Pages / Blog / Products ============ -->
  <xsl:template match="s:sitemapindex">
    <div class="stat-row">
      <div class="stat">
        <b><xsl:value-of select="count(s:sitemap)"/></b>
        <span>Sitemaps</span>
      </div>
    </div>
    <div class="card">
      <table>
        <tr>
          <th class="num">#</th>
          <th>Section</th>
          <th class="hide-sm">Last updated</th>
        </tr>
        <xsl:for-each select="s:sitemap">
          <tr>
            <td class="num"><xsl:value-of select="position()"/></td>
            <td>
              <a href="{s:loc}">
                <xsl:choose>
                  <xsl:when test="contains(s:loc, 'sitemap-pages')">Pages</xsl:when>
                  <xsl:when test="contains(s:loc, 'sitemap-blog')">Blog</xsl:when>
                  <xsl:when test="contains(s:loc, 'sitemap-products')">Products</xsl:when>
                  <xsl:otherwise><xsl:value-of select="s:loc"/></xsl:otherwise>
                </xsl:choose>
              </a>
            </td>
            <td class="meta hide-sm"><xsl:value-of select="s:lastmod"/></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
    <p class="note">Click a section to see the pages it contains.</p>
  </xsl:template>

  <!-- ============ URL list view ============ -->
  <xsl:template match="s:urlset">
    <div class="stat-row">
      <div class="stat">
        <b><xsl:value-of select="count(s:url)"/></b>
        <span>URLs</span>
      </div>
      <div class="stat">
        <b><xsl:value-of select="count(s:url/image:image)"/></b>
        <span>Images</span>
      </div>
    </div>
    <div class="card">
      <table>
        <tr>
          <th class="num">#</th>
          <th>URL</th>
          <th class="hide-sm">Priority</th>
          <th class="hide-sm">Updated</th>
        </tr>
        <xsl:for-each select="s:url">
          <tr>
            <td class="num"><xsl:value-of select="position()"/></td>
            <td>
              <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
              <xsl:if test="image:image">
                <span class="pill img"><xsl:value-of select="count(image:image)"/> img</span>
              </xsl:if>
            </td>
            <td class="hide-sm"><span class="pill"><xsl:value-of select="s:priority"/></span></td>
            <td class="meta hide-sm"><xsl:value-of select="s:lastmod"/></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
    <p class="note"><a href="/sitemap.xml">← Back to all sections</a></p>
  </xsl:template>

</xsl:stylesheet>
