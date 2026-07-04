const fs = require("node:fs");
const path = require("node:path");
const {
  PRIORITY_QUERY_MAPPINGS,
  SEO_PAGES,
  SITE_URL,
} = require("./seo-page-data");

const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function defaultRoutesFromMappings({
  pages = SEO_PAGES,
  mappings = PRIORITY_QUERY_MAPPINGS,
} = {}) {
  const byPath = new Map();

  for (const mapping of mappings) {
    const existing = byPath.get(mapping.targetPath) ?? {
      id: routeId(mapping.targetPath),
      query: mapping.query,
      routePath: mapping.targetPath,
      impact: mapping.impact,
      requiredPhrases: [],
      requiredLinks: [],
      requiredJsonLdTypes: [],
      minWordCount: mapping.targetPath === "/events/past-events" ? 500 : 120,
    };
    const page = pages.find((item) => item.path === mapping.targetPath);

    existing.query = existing.query || mapping.query;
    existing.impact = Math.max(existing.impact, mapping.impact);
    existing.expectedTitle = page?.title ?? existing.expectedTitle;
    existing.requiredPhrases = unique([
      ...existing.requiredPhrases,
      ...(mapping.requiredPhrases ?? []),
    ]);
    existing.requiredLinks = unique([
      ...existing.requiredLinks,
      ...(mapping.requiredLinks ?? []),
    ]);
    existing.requiredJsonLdTypes = unique([
      ...existing.requiredJsonLdTypes,
      ...(mapping.requiredJsonLdTypes ?? []),
    ]);

    byPath.set(mapping.targetPath, existing);
  }

  return [...byPath.values()].sort((a, b) => (
    b.impact - a.impact || a.routePath.localeCompare(b.routePath)
  ));
}

async function auditLiveHtml({
  routes = defaultRoutesFromMappings(),
  siteUrl = SITE_URL,
  fetchHtml = defaultFetchHtml,
} = {}) {
  const results = [];
  const findings = [];

  for (const route of routes) {
    const url = absoluteUrl(siteUrl, route.routePath);
    try {
      const html = await fetchHtml(url, route);
      const result = inspectHtml({ ...route, url, html });
      results.push(result);
      findings.push(...result.findings);
    } catch (error) {
      const issue = error instanceof Error ? error.message : String(error);
      const result = emptyResult({ ...route, url }, issue);
      results.push(result);
      findings.push(toFinding(route, "critical", `live HTML fetch failed: ${issue}`));
    }
  }

  const rankedFindings = rankFindings(findings);

  return {
    generatedAt: new Date().toISOString(),
    siteUrl,
    summary: {
      routes: routes.length,
      routesWithIssues: results.filter((result) => result.findings.length > 0).length,
      criticalHighFindings: rankedFindings.filter((finding) => (
        finding.severity === "critical" || finding.severity === "high"
      )).length,
      findingsBySeverity: severityCounts(rankedFindings),
    },
    results,
    findings: rankedFindings,
  };
}

function inspectHtml({
  query = "",
  routePath,
  id = routeId(routePath),
  impact = 3,
  url,
  html,
  expectedTitle = "",
  requiredPhrases = [],
  requiredLinks = [],
  requiredJsonLdTypes = [],
  minWordCount = 120,
}) {
  const text = stripHtml(html);
  const title = extractTitle(html);
  const canonical = extractCanonical(html);
  const jsonLdTypes = extractJsonLdTypes(html);
  const wordCount = wordCountFromText(text);
  const hasPrerenderRoot = /<main\b[^>]*data-bgsnl-prerender=["']true["'][^>]*>/i.test(html);
  const internalLinks = countInternalLinks(html);
  const findings = [];
  const route = { id, query, routePath, impact };

  if (!hasPrerenderRoot) {
    findings.push(toFinding(route, "critical", "live HTML is missing prerendered crawler content"));
  }
  if (expectedTitle && title !== expectedTitle) {
    findings.push(toFinding(route, "high", "live HTML title does not match expected route title"));
  }
  if (!canonical || canonical !== url) {
    findings.push(toFinding(route, "high", `live HTML canonical does not match ${url}`));
  }
  for (const phrase of requiredPhrases.filter((phrase) => !includesText(text, phrase))) {
    findings.push(toFinding(route, "high", `live HTML missing answer-ready phrase: ${phrase}`));
  }
  for (const link of requiredLinks.filter((link) => !includesText(html, link))) {
    findings.push(toFinding(route, "high", `live HTML missing required link: ${link}`));
  }
  for (const type of requiredJsonLdTypes.filter((type) => !jsonLdTypes.includes(type))) {
    findings.push(toFinding(route, "high", `live HTML missing JSON-LD type: ${type}`));
  }
  if (wordCount < minWordCount) {
    findings.push(toFinding(route, "medium", `live HTML has ${wordCount} words; expected at least ${minWordCount}`));
  }

  return {
    id,
    query,
    routePath,
    url,
    status: "fetched",
    title,
    canonical,
    hasPrerenderRoot,
    wordCount,
    internalLinks,
    jsonLdTypes,
    findings: rankFindings(findings),
  };
}

async function defaultFetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "BGSNL SEO/GEO live audit (+https://www.bulgariansociety.nl)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function emptyResult(route, issue) {
  return {
    id: route.id,
    query: route.query,
    routePath: route.routePath,
    url: route.url,
    status: "error",
    error: issue,
    title: "",
    canonical: "",
    hasPrerenderRoot: false,
    wordCount: 0,
    internalLinks: 0,
    jsonLdTypes: [],
    findings: [toFinding(route, "critical", `live HTML fetch failed: ${issue}`)],
  };
}

function extractTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function extractCanonical(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
}

function extractJsonLdTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectTypes(JSON.parse(match[1]), types);
    } catch {
      // Invalid JSON-LD will be surfaced as missing required structured data.
    }
  }
  return [...types].sort();
}

function collectTypes(value, types) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectTypes(item, types));
    return;
  }
  if (typeof value["@type"] === "string") types.add(value["@type"]);
  Object.values(value).forEach((item) => collectTypes(item, types));
}

function countInternalLinks(html) {
  const links = new Set();
  for (const match of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)) {
    if (match[1].startsWith("/")) links.add(match[1]);
  }
  return links.size;
}

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCountFromText(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function includesText(text, needle) {
  return text.toLowerCase().includes(String(needle).toLowerCase());
}

function toFinding(route, severity, issue) {
  return {
    id: route.id,
    query: route.query ?? "",
    targetPath: route.routePath,
    severity,
    impact: route.impact ?? 3,
    issue,
  };
}

function rankFindings(findings) {
  return [...findings].sort((a, b) => {
    const severity = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (severity !== 0) return severity;
    const impact = (b.impact ?? 0) - (a.impact ?? 0);
    if (impact !== 0) return impact;
    return String(a.id).localeCompare(String(b.id));
  });
}

function severityCounts(findings) {
  return findings.reduce(
    (counts, finding) => {
      counts[finding.severity] += 1;
      return counts;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function absoluteUrl(siteUrl, routePath) {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${routePath === "/" ? "/" : routePath}`;
}

function routeId(routePath) {
  return routePath === "/"
    ? "home"
    : routePath.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
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

async function main() {
  const argv = process.argv.slice(2);
  const outPath = argValue(argv, "--out") ?? positionalArg(argv, ["--site-url"]);
  const siteUrl = argValue(argv, "--site-url") ?? SITE_URL;
  const audit = await auditLiveHtml({ siteUrl });
  const output = `${JSON.stringify(audit, null, 2)}\n`;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`BGSNL live HTML audit written to ${outPath}`);
  } else {
    console.log(output);
  }

  if (audit.summary.criticalHighFindings > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  auditLiveHtml,
  defaultRoutesFromMappings,
  inspectHtml,
  rankFindings,
};
