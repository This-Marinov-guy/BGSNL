const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_SITE_URL = "https://www.bulgariansociety.nl";

function crawlSitemapBuild({
  buildDir = path.join(__dirname, "..", "build"),
  sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml"),
  siteUrl = DEFAULT_SITE_URL,
} = {}) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const urls = extractSitemapUrls(sitemap);
  const pages = urls.map((url) => inspectUrl({ buildDir, siteUrl, url }));
  const issueBreakdown = {};

  for (const page of pages) {
    for (const issue of page.issues) {
      issueBreakdown[issue] = (issueBreakdown[issue] || 0) + 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    buildDir,
    sitemapPath,
    summary: {
      sitemapUrls: urls.length,
      prerenderedUrls: pages.filter((page) => page.exists && page.hasPrerenderedRoot).length,
      missingPrerenderedUrls: pages.filter((page) => !page.exists).length,
      pagesWithIssues: pages.filter((page) => page.issues.length > 0).length,
      issueBreakdown,
    },
    pages,
  };
}

function inspectUrl({ buildDir, siteUrl, url }) {
  const routePath = routePathFromUrl(url, siteUrl);
  const filePath = htmlPathForRoute(buildDir, routePath);
  const issues = [];
  let exists = fs.existsSync(filePath);
  let hasPrerenderedRoot = false;
  let title = "";
  let canonical = "";

  if (!exists) {
    issues.push("missing prerendered HTML file");
  } else {
    const html = fs.readFileSync(filePath, "utf8");
    hasPrerenderedRoot = /<div id="root">\s*<main data-bgsnl-prerender="true"/i.test(html);
    title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || "";

    if (!hasPrerenderedRoot) issues.push("missing prerendered crawler root");
    if (!title) issues.push("missing title");
    if (!canonical) issues.push("missing canonical");
  }

  return {
    url,
    routePath,
    filePath,
    exists,
    hasPrerenderedRoot,
    title,
    canonical,
    issues,
  };
}

function extractSitemapUrls(sitemap) {
  return [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function routePathFromUrl(url, siteUrl) {
  const parsed = new URL(url);
  const base = new URL(siteUrl);
  if (parsed.host !== base.host) return parsed.pathname || "/";
  return parsed.pathname || "/";
}

function htmlPathForRoute(buildDir, routePath) {
  if (routePath === "/") return path.join(buildDir, "index.html");
  return path.join(buildDir, ...routePath.replace(/^\/+|\/+$/g, "").split("/"), "index.html");
}

function argValue(argv, key) {
  const prefix = `${key}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = argv.indexOf(key);
  return index >= 0 ? argv[index + 1] : undefined;
}

function positionalArg(argv, valueOptions = []) {
  const valueIndexes = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    if (valueOptions.includes(argv[index])) valueIndexes.add(index + 1);
  }
  return argv.find((arg, index) => !arg.startsWith("-") && !valueIndexes.has(index));
}

function main() {
  const argv = process.argv.slice(2);
  const buildDir = argValue(argv, "--build-dir") || path.join(__dirname, "..", "build");
  const sitemapPath = argValue(argv, "--sitemap") || path.join(__dirname, "..", "public", "sitemap.xml");
  const outPath = argValue(argv, "--out") ?? positionalArg(argv, ["--build-dir", "--sitemap"]);
  const crawl = crawlSitemapBuild({ buildDir, sitemapPath });
  const output = `${JSON.stringify(crawl, null, 2)}\n`;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`Full-site sitemap crawl written to ${outPath}`);
  } else {
    console.log(output);
  }

  if (crawl.summary.pagesWithIssues > 0) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  crawlSitemapBuild,
  extractSitemapUrls,
  htmlPathForRoute,
};
