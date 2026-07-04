const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  SEO_PAGES,
  SITE_URL,
  getSeoPageForPath,
} = require("./seo-page-data");
const { generatePrerenderedHtml } = require("./generate-prerendered-html");

const DEFAULT_REPORT_DIR = path.join(
  __dirname,
  "..",
  "bulgariansociety_29-jun-2026_all-issues_2026-07-04_18-07-42",
);

const INDEXABLE_ISSUE_FILES = [
  "Error-Duplicate_pages_without_canonical.csv",
  "Error-indexable-Orphan_page_(has_no_incoming_internal_links).csv",
  "Error-indexable-Page_has_no_outgoing_links.csv",
  "Warning-indexable-H1_tag_missing_or_empty.csv",
  "Warning-indexable-Low_word_count.csv",
  "Warning-indexable-Meta_description_too_long.csv",
  "Warning-X_(Twitter)_card_incomplete.csv",
];

const REDIRECT_ISSUE_FILES = [
  "Notice-HTTP_to_HTTPS_redirect.csv",
  "Notice-Redirect_chain.csv",
  "Warning-3XX_redirect.csv",
];

function readReportRows(reportDir, fileName) {
  const filePath = path.join(reportDir, fileName);
  const records = parseTsv(readTextFile(filePath));
  const [headers, ...rows] = records;
  return rows
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ));
}

function readTextFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    throw new Error(`Unsupported UTF-16BE file: ${filePath}`);
  }
  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function parseTsv(raw) {
  const records = [];
  let row = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "\t" && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some(Boolean)) records.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some(Boolean)) records.push(row);

  return records.map((record) => record.map((value, index) => (
    index === 0 ? value.replace(/^\uFEFF/, "") : value
  )));
}

function affectedIndexablePaths(reportDir) {
  const paths = new Set();

  for (const fileName of INDEXABLE_ISSUE_FILES) {
    for (const row of readReportRows(reportDir, fileName)) {
      const url = new URL(row.URL);
      if (url.origin === SITE_URL) paths.add(url.pathname || "/");
    }
  }

  return [...paths].sort();
}

function htmlPathForRoute(buildDir, routePath) {
  if (routePath === "/") return path.join(buildDir, "index.html");
  return path.join(buildDir, ...routePath.replace(/^\/+|\/+$/g, "").split("/"), "index.html");
}

function metaContent(html, attrName, attrValue) {
  const attr = escapeRegExp(attrName);
  const value = escapeRegExp(attrValue);
  const forward = new RegExp(`<meta\\s+[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  const reverse = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${value}["'][^>]*>`, "i");
  return html.match(forward)?.[1] ?? html.match(reverse)?.[1] ?? "";
}

function canonicalHref(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
}

function countInternalLinks(html) {
  const links = new Set();
  for (const match of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)) {
    if (match[1].startsWith("/")) links.add(match[1]);
  }
  return links.size;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertBaseHtmlIsCrawlerSafe(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const description = metaContent(html, "name", "description");

  assert.equal(
    metaContent(html, "name", "twitter:card"),
    "summary_large_image",
    `${filePath} should expose a valid Twitter summary_large_image card`,
  );
  assert.ok(description.length > 0 && description.length <= 160, `${filePath} meta description should be 1-160 characters`);
}

function assertNoRedirectingOrigins(reportDir) {
  const redirectUrls = REDIRECT_ISSUE_FILES.flatMap((fileName) => (
    readReportRows(reportDir, fileName).map((row) => row.URL).filter(Boolean)
  ));
  const redirectOrigins = new Set(
    redirectUrls.map((url) => {
      const parsed = new URL(url);
      return parsed.origin;
    }),
  );
  const sourceFiles = [
    path.join(__dirname, "..", "package.json"),
    path.join(__dirname, "..", "public", "robots.txt"),
    path.join(__dirname, "..", "index.html"),
    path.join(__dirname, "..", "public", "index.html"),
  ];

  for (const filePath of sourceFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    for (const origin of redirectOrigins) {
      assert.doesNotMatch(source, new RegExp(escapeRegExp(origin)), `${filePath} should not reference redirecting origin ${origin}`);
    }
  }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const reportDir = process.argv[2] || DEFAULT_REPORT_DIR;
const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), "bgsnl-ahrefs-report-"));
fs.writeFileSync(
  path.join(buildDir, "index.html"),
  fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"),
  "utf8",
);

const affectedPaths = affectedIndexablePaths(reportDir);
assert.equal(affectedPaths.length, 48, "Ahrefs report should contain 48 affected indexable URLs");

for (const routePath of affectedPaths) {
  assert.doesNotThrow(
    () => getSeoPageForPath(routePath),
    `missing SEO page data for Ahrefs URL ${routePath}`,
  );
}

generatePrerenderedHtml({ buildDir, pages: SEO_PAGES });

for (const routePath of affectedPaths) {
  const page = getSeoPageForPath(routePath);
  const filePath = htmlPathForRoute(buildDir, routePath);
  assert.ok(fs.existsSync(filePath), `missing prerendered HTML for ${routePath}`);

  const html = fs.readFileSync(filePath, "utf8");
  const description = metaContent(html, "name", "description");
  const twitterCard = metaContent(html, "name", "twitter:card");
  const twitterTitle = metaContent(html, "name", "twitter:title");
  const twitterDescription = metaContent(html, "name", "twitter:description");
  const twitterImage = metaContent(html, "name", "twitter:image");
  const bodyText = stripHtml(html);

  assert.equal(canonicalHref(html), page.url, `${routePath} should have a route-specific canonical`);
  assert.match(html, new RegExp(`<h1>${escapeRegExp(page.h1)}</h1>`), `${routePath} should expose a route-specific H1`);
  assert.equal(twitterCard, "summary_large_image", `${routePath} should have a complete Twitter card`);
  assert.ok(twitterTitle, `${routePath} should have twitter:title`);
  assert.ok(twitterDescription, `${routePath} should have twitter:description`);
  assert.ok(twitterImage, `${routePath} should have twitter:image`);
  assert.ok(description.length > 0 && description.length <= 160, `${routePath} meta description should be 1-160 characters`);
  assert.ok(bodyText.split(/\s+/).length >= 120, `${routePath} should expose enough prerendered body copy`);
  assert.ok(countInternalLinks(html) >= 4, `${routePath} should expose outgoing internal links`);
}

assertBaseHtmlIsCrawlerSafe(path.join(__dirname, "..", "index.html"));
assertBaseHtmlIsCrawlerSafe(path.join(__dirname, "..", "public", "index.html"));
assertNoRedirectingOrigins(reportDir);

console.log("Ahrefs report self-test passed");
