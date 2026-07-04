const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { crawlSitemapBuild } = require("./full-site-sitemap-crawl");

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "bgsnl-full-crawl-"));
const buildDir = path.join(workDir, "build");
const sitemapPath = path.join(workDir, "sitemap.xml");

fs.mkdirSync(path.join(buildDir, "about"), { recursive: true });
fs.writeFileSync(
  path.join(buildDir, "index.html"),
  '<html><head><title>Home</title><link rel="canonical" href="https://example.com/"></head><body><div id="root"><main data-bgsnl-prerender="true">Home</main></div></body></html>',
  "utf8",
);
fs.writeFileSync(
  path.join(buildDir, "about", "index.html"),
  '<html><head><title>About</title><link rel="canonical" href="https://example.com/about"></head><body><div id="root"><main data-bgsnl-prerender="true">About</main></div></body></html>',
  "utf8",
);
fs.writeFileSync(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/missing</loc></url>
</urlset>`,
  "utf8",
);

const crawl = crawlSitemapBuild({ buildDir, sitemapPath, siteUrl: "https://example.com" });

assert.equal(crawl.summary.sitemapUrls, 3);
assert.equal(crawl.summary.prerenderedUrls, 2);
assert.equal(crawl.summary.missingPrerenderedUrls, 1);
assert.equal(crawl.summary.pagesWithIssues, 1);
assert.deepEqual(crawl.summary.issueBreakdown, {
  "missing prerendered HTML file": 1,
});

console.log("Full-site sitemap crawl self-test passed");
