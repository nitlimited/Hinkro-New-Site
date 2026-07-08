/**
 * Rank Math-style SEO analyzer.
 * Pure functions: feed it the editable fields, get back grouped pass/fail
 * checks and a weighted 0–100 score. Runs live on every keystroke.
 */

export type SeoCheckStatus = "pass" | "fail" | "hint";
export type SeoGroup =
  | "basic"
  | "additional"
  | "title_readability"
  | "content_readability";

export interface SeoCheck {
  id: string;
  group: SeoGroup;
  status: SeoCheckStatus;
  message: string;
  weight: number;
}

export interface SeoAnalysis {
  score: number; // 0–100
  rating: "great" | "ok" | "poor";
  checks: SeoCheck[];
  keywordDensity: number;
  wordCount: number;
}

export interface SeoInput {
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  /** full public path, e.g. /product/ombre-kente-bespoke-order/ */
  urlPath: string;
  /** main content (plain text, markdown, or HTML) */
  content: string;
  /** alt attributes of attached images (product gallery / featured image) */
  imageAlts: string[];
  /** focus keywords already used on other posts/products */
  usedKeywords: string[];
}

/* ---------- word lists ---------- */

const POWER_WORDS = [
  "amazing", "authentic", "best", "bespoke", "bold", "brilliant", "captivating",
  "certified", "complete", "custom", "dazzling", "definitive", "delightful",
  "effortless", "elegant", "essential", "exclusive", "exquisite", "extraordinary",
  "free", "genuine", "gorgeous", "guaranteed", "handmade", "heritage", "iconic",
  "incredible", "inspiring", "instant", "irresistible", "legendary", "luxurious",
  "luxury", "magical", "majestic", "masterful", "memorable", "modern", "perfect",
  "premium", "proven", "radiant", "rare", "refined", "regal", "remarkable",
  "royal", "secret", "signature", "special", "striking", "stunning", "superb",
  "timeless", "trusted", "ultimate", "unforgettable", "unique", "vibrant",
];

const POSITIVE_WORDS = [
  "beautiful", "brilliant", "celebrate", "delight", "enjoy", "excellent",
  "fantastic", "good", "great", "happy", "joy", "love", "perfect", "pride",
  "wonderful", "win", "success", "inspiring", "elegant", "stunning",
];

const NEGATIVE_WORDS = [
  "avoid", "bad", "beware", "danger", "fail", "mistake", "never", "problem",
  "risk", "stop", "terrible", "warning", "worst", "wrong",
];

/* ---------- parsing helpers ---------- */

const stripTags = (text: string) => text.replace(/<[^>]+>/g, " ");

export function countWords(text: string): number {
  const clean = stripTags(text).replace(/[#*_>\-\[\]()!`]/g, " ");
  return clean.split(/\s+/).filter(Boolean).length;
}

function normalize(text: string): string {
  return stripTags(text).toLowerCase().replace(/\s+/g, " ").trim();
}

function keywordOccurrences(content: string, keyword: string): number {
  if (!keyword) return 0;
  const haystack = normalize(content);
  const needle = keyword.toLowerCase().trim();
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

function extractHeadings(content: string): string[] {
  const md = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1]);
  const html = [...content.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(
    (m) => stripTags(m[1]),
  );
  return [...md, ...html];
}

interface LinkInfo {
  url: string;
  nofollow: boolean;
}

function extractLinks(content: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  for (const m of content.matchAll(/\[[^\]]*\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g)) {
    links.push({ url: m[1], nofollow: false });
  }
  for (const m of content.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    links.push({ url: m[1], nofollow: /rel=["'][^"']*nofollow/i.test(m[0]) });
  }
  for (const m of content.matchAll(/(?<![("'\]=])(https?:\/\/[^\s<)"']+)/g)) {
    if (!links.some((l) => l.url === m[1])) {
      links.push({ url: m[1], nofollow: false });
    }
  }
  return links;
}

const INTERNAL_HOSTS = ["hinkrokente.com", "www.hinkrokente.com"];

function isInternal(url: string): boolean {
  if (url.startsWith("/") || url.startsWith("#")) return true;
  try {
    return INTERNAL_HOSTS.includes(new URL(url).hostname);
  } catch {
    return true;
  }
}

function extractContentImages(content: string): { alt: string }[] {
  const md = [...content.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)].map((m) => ({
    alt: m[1],
  }));
  const html = [...content.matchAll(/<img\s[^>]*>/gi)].map((m) => ({
    alt: /alt=["']([^"']*)["']/i.exec(m[0])?.[1] ?? "",
  }));
  return [...md, ...html];
}

function hasVideo(content: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|\.mp4|<video/i.test(content);
}

function paragraphs(content: string): string[] {
  return stripTags(content)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ---------- the analyzer ---------- */

export function analyzeSeo(input: SeoInput): SeoAnalysis {
  const kw = input.focusKeyword.trim();
  const kwLower = kw.toLowerCase();
  const checks: SeoCheck[] = [];
  const add = (
    id: string,
    group: SeoGroup,
    weight: number,
    pass: boolean,
    passMsg: string,
    failMsg: string,
  ) =>
    checks.push({
      id,
      group,
      weight,
      status: pass ? "pass" : "fail",
      message: pass ? passMsg : failMsg,
    });

  const wordCount = countWords(input.content);
  const occurrences = keywordOccurrences(input.content, kw);
  const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
  const headings = extractHeadings(input.content);
  const links = extractLinks(input.content);
  const externalLinks = links.filter((l) => !isInternal(l.url));
  const internalLinks = links.filter((l) => isInternal(l.url));
  const contentImages = extractContentImages(input.content);
  const allAlts = [
    ...input.imageAlts.filter(Boolean),
    ...contentImages.map((i) => i.alt),
  ];
  const hasKw = (text: string) => Boolean(kw) && normalize(text).includes(kwLower);

  /* ===== BASIC SEO ===== */

  add(
    "kw-in-title", "basic", 10,
    hasKw(input.seoTitle),
    "Hurray! You're using Focus Keyword in the SEO Title.",
    "Focus Keyword does not appear in the SEO Title.",
  );
  add(
    "kw-in-description", "basic", 5,
    hasKw(input.seoDescription),
    "Focus Keyword used inside SEO Meta Description.",
    "Focus Keyword not found in your SEO Meta Description.",
  );
  const slugified = kwLower.replace(/[^a-z0-9]+/g, "-");
  add(
    "kw-in-url", "basic", 8,
    Boolean(kw) && input.urlPath.toLowerCase().includes(slugified),
    "Focus Keyword used in the URL.",
    "Focus Keyword not found in the URL.",
  );
  const firstTenth = stripTags(input.content).slice(
    0,
    Math.max(200, Math.floor(stripTags(input.content).length * 0.1)),
  );
  add(
    "kw-first-10", "basic", 5,
    hasKw(firstTenth),
    "Focus Keyword appears in the first 10% of the content.",
    "Focus Keyword doesn't appear at the beginning of your content.",
  );
  add(
    "kw-in-content", "basic", 5,
    occurrences > 0,
    "Focus Keyword found in the content.",
    "Focus Keyword doesn't appear in the content.",
  );
  const lengthScore =
    wordCount >= 2500 ? 12 : wordCount >= 2000 ? 10 : wordCount >= 1500 ? 8
    : wordCount >= 1000 ? 6 : wordCount >= 600 ? 5 : wordCount >= 300 ? 2 : 0;
  checks.push({
    id: "content-length",
    group: "basic",
    weight: 12,
    status: wordCount >= 600 ? "pass" : "fail",
    message:
      wordCount >= 600
        ? `Content is ${wordCount} words long. Good job!`
        : `Content is ${wordCount} words long. Consider using at least 600 words.`,
  });

  /* ===== ADDITIONAL SEO ===== */

  add(
    "kw-in-subheadings", "additional", 4,
    headings.some((h) => hasKw(h)),
    "Focus Keyword found in the subheading(s).",
    "Focus Keyword not found in subheading(s) like H2, H3, H4, etc.",
  );
  add(
    "kw-in-image-alt", "additional", 3,
    allAlts.some((alt) => hasKw(alt)),
    "Focus Keyword found in image alt attribute(s).",
    "Focus Keyword not found in image alt attribute(s).",
  );
  const densityOk = density >= 0.5 && density <= 2.5 && occurrences > 0;
  checks.push({
    id: "keyword-density",
    group: "additional",
    weight: 5,
    status: densityOk ? "pass" : "fail",
    message: densityOk
      ? `Keyword Density is ${density.toFixed(2)}, the Focus Keyword and combination appears ${occurrences} time${occurrences === 1 ? "" : "s"}.`
      : occurrences === 0
        ? "Keyword Density is 0. Aim for around 1% by using the Focus Keyword naturally."
        : `Keyword Density is ${density.toFixed(2)} — aim for between 0.5 and 2.5.`,
  });
  const urlLen = input.urlPath.length;
  add(
    "url-length", "additional", 3,
    urlLen > 0 && urlLen <= 75,
    `URL is ${urlLen} characters long. Kudos!`,
    `URL is ${urlLen} characters long. Consider shortening it to 75 characters or less.`,
  );
  add(
    "external-links", "additional", 2,
    externalLinks.length > 0,
    "Great! You are linking to external resources.",
    "No outbound links were found. Link out to external resources.",
  );
  add(
    "external-dofollow", "additional", 1,
    externalLinks.some((l) => !l.nofollow),
    "At least one external link with DoFollow found in your content.",
    "We found no DoFollow external links in your content.",
  );
  add(
    "internal-links", "additional", 3,
    internalLinks.length > 0,
    "You are linking to other resources on your website which is great.",
    "We couldn't find any internal links in your content.",
  );
  add(
    "kw-unique", "additional", 2,
    Boolean(kw) &&
      !input.usedKeywords.some((u) => u.toLowerCase().trim() === kwLower),
    "You haven't used this Focus Keyword before.",
    "You have already used this Focus Keyword on another post or product.",
  );
  checks.push({
    id: "content-ai",
    group: "additional",
    weight: 0,
    status: "hint",
    message: "Use Content AI to optimise the Post.",
  });

  /* ===== TITLE READABILITY ===== */

  const titleLower = normalize(input.seoTitle);
  const kwPosition = kw ? titleLower.indexOf(kwLower) : -1;
  add(
    "kw-title-start", "title_readability", 3,
    kwPosition === 0 || (kwPosition > 0 && kwPosition <= Math.floor(titleLower.length * 0.3)),
    "Focus Keyword used at the beginning of SEO title.",
    "Focus Keyword doesn't appear at the beginning of the SEO title.",
  );
  const titleWords = titleLower.split(/\s+/);
  add(
    "title-sentiment", "title_readability", 1,
    titleWords.some(
      (w) => POSITIVE_WORDS.includes(w) || NEGATIVE_WORDS.includes(w),
    ),
    "Your title has a positive or a negative sentiment word.",
    "Your title doesn't contain a positive or a negative sentiment word.",
  );
  const powerCount = titleWords.filter((w) => POWER_WORDS.includes(w)).length;
  add(
    "title-power-word", "title_readability", 1,
    powerCount > 0,
    `Your title contains ${powerCount} power word(s). Booyah!`,
    "Your title doesn't contain a power word. Add at least one.",
  );
  add(
    "title-number", "title_readability", 1,
    /\d/.test(input.seoTitle),
    "You are using a number in your SEO title.",
    "Your SEO title doesn't contain a number.",
  );

  /* ===== CONTENT READABILITY ===== */

  add(
    "toc", "content_readability", 2,
    /\[toc\]|table of contents/i.test(input.content),
    "You seem to be using a Table of Contents to break down your text.",
    "You don't seem to be using a Table of Contents.",
  );
  const paras = paragraphs(input.content);
  const longParas = paras.filter((p) => countWords(p) > 120);
  add(
    "short-paragraphs", "content_readability", 3,
    paras.length === 0 || longParas.length === 0,
    "You are using short paragraphs.",
    `${longParas.length} paragraph(s) are over 120 words — break them up.`,
  );
  add(
    "content-media", "content_readability", 4,
    contentImages.length > 0 || input.imageAlts.length > 0 || hasVideo(input.content),
    "Your content contains images and/or video(s).",
    "Add a few images and/or videos to make your content appealing.",
  );

  /* ===== score ===== */

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce(
    (sum, c) =>
      sum +
      (c.id === "content-length"
        ? lengthScore
        : c.status === "pass"
          ? c.weight
          : 0),
    0,
  );
  const score = kw
    ? Math.round((earned / totalWeight) * 100)
    : 0;

  return {
    score,
    rating: score >= 81 ? "great" : score >= 51 ? "ok" : "poor",
    checks,
    keywordDensity: density,
    wordCount,
  };
}

/* ---------- schema (structured data) ---------- */

export type SchemaType = "Product" | "Article" | "BlogPosting" | "None";

export function buildSchema(
  type: SchemaType,
  fields: {
    name: string;
    description: string;
    url: string;
    image?: string;
    priceGhs?: number | null;
    priceUsd?: number | null;
    author?: string;
    datePublished?: string;
  },
): Record<string, unknown> | null {
  if (type === "None") return null;
  const base = {
    "@context": "https://schema.org",
    "@type": type,
    name: fields.name,
    description: fields.description,
    url: `https://www.hinkrokente.com${fields.url}`,
    ...(fields.image ? { image: fields.image } : {}),
  };
  if (type === "Product") {
    return {
      ...base,
      brand: { "@type": "Brand", name: "Hinkro Kente" },
      offers: {
        "@type": "Offer",
        priceCurrency: fields.priceUsd ? "USD" : "GHS",
        price: fields.priceUsd ?? fields.priceGhs ?? undefined,
        availability: "https://schema.org/InStock",
        url: `https://www.hinkrokente.com${fields.url}`,
      },
    };
  }
  return {
    ...base,
    headline: fields.name,
    author: { "@type": "Organization", name: fields.author || "Hinkro Kente" },
    publisher: { "@type": "Organization", name: "Hinkro Kente" },
    ...(fields.datePublished ? { datePublished: fields.datePublished } : {}),
  };
}
