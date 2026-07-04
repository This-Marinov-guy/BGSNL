const fs = require("node:fs");
const path = require("node:path");
const {
  PRIORITY_QUERY_MAPPINGS,
  SEO_PAGES,
} = require("./seo-page-data");

const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function auditBuiltHtml({
  buildDir = path.join(__dirname, "..", "build"),
  pages = SEO_PAGES,
  mappings = PRIORITY_QUERY_MAPPINGS,
} = {}) {
  const findings = [];
  const results = mappings.map((mapping) => {
    const page = pages.find((item) => item.path === mapping.targetPath);
    const filePath = htmlPathForRoute(buildDir, mapping.targetPath);
    if (!page) {
      findings.push(toFinding(mapping, "critical", `missing route data for ${mapping.targetPath}`));
    }
    if (!fs.existsSync(filePath)) {
      findings.push(toFinding(mapping, "critical", `missing built HTML file for ${mapping.targetPath}`));
      return emptyResult(mapping, filePath);
    }

    const html = fs.readFileSync(filePath, "utf8");
    const text = stripHtml(html);
    const title = extractTitle(html);
    const description = extractMeta(html, "name", "description");
    const canonical = extractCanonical(html);
    const jsonLdTypes = extractJsonLdTypes(html);
    const internalLinks = countInternalLinks(html);
    const missingPhrases = (mapping.requiredPhrases ?? []).filter((phrase) => !includesText(text, phrase));
    const missingLinks = (mapping.requiredLinks ?? []).filter((link) => !includesText(html, link));
    const missingJsonLdTypes = (mapping.requiredJsonLdTypes ?? []).filter((type) => !jsonLdTypes.includes(type));
    const answerFirst = includesText(text, "Quick answer");
    const cited = (page?.citations ?? []).some((source) => includesText(html, source.url));

    if (!title || title === "Bulgarian Society Netherlands") {
      findings.push(toFinding(mapping, "high", "built HTML has generic or missing title"));
    }
    if (!description || description === "Generic description") {
      findings.push(toFinding(mapping, "high", "built HTML has generic or missing meta description"));
    }
    if (!canonical || canonical !== page?.url) {
      findings.push(toFinding(mapping, "high", `built HTML canonical does not match ${page?.url ?? mapping.targetPath}`));
    }
    if (!/<div id="root">\s*<main data-bgsnl-prerender="true"/i.test(html)) {
      findings.push(toFinding(mapping, "critical", "built HTML root does not contain prerendered crawler content"));
    }
    for (const phrase of missingPhrases) {
      findings.push(toFinding(mapping, "high", `built HTML missing answer-ready phrase: ${phrase}`));
    }
    for (const link of missingLinks) {
      findings.push(toFinding(mapping, "high", `built HTML missing required link: ${link}`));
    }
    for (const type of missingJsonLdTypes) {
      findings.push(toFinding(mapping, "high", `built HTML missing JSON-LD type: ${type}`));
    }
    if (mapping.requiresAnswerFirst && !answerFirst) {
      findings.push(toFinding(mapping, "high", "built HTML does not expose Quick answer"));
    }
    if (mapping.requiresCitation && !cited) {
      findings.push(toFinding(mapping, "high", "built HTML does not expose source citations"));
    }
    if (mapping.minInternalLinks && internalLinks < mapping.minInternalLinks) {
      findings.push(toFinding(mapping, "medium", `built HTML has ${internalLinks} internal links; expected at least ${mapping.minInternalLinks}`));
    }

    return {
      id: mapping.id,
      query: mapping.query,
      targetPath: mapping.targetPath,
      filePath,
      title,
      description,
      canonical,
      answerFirst,
      cited,
      internalLinks,
      jsonLdTypes,
      missingPhrases,
      missingLinks,
      missingJsonLdTypes,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    buildDir,
    results,
    findings: rankFindings(findings),
  };
}

function htmlPathForRoute(buildDir, routePath) {
  if (routePath === "/") return path.join(buildDir, "index.html");
  return path.join(buildDir, ...routePath.replace(/^\/+|\/+$/g, "").split("/"), "index.html");
}

function emptyResult(mapping, filePath) {
  return {
    id: mapping.id,
    query: mapping.query,
    targetPath: mapping.targetPath,
    filePath,
    title: "",
    description: "",
    canonical: "",
    answerFirst: false,
    cited: false,
    internalLinks: 0,
    jsonLdTypes: [],
    missingPhrases: mapping.requiredPhrases ?? [],
    missingLinks: mapping.requiredLinks ?? [],
    missingJsonLdTypes: mapping.requiredJsonLdTypes ?? [],
  };
}

function extractTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function extractMeta(html, attrName, attrValue) {
  const re = new RegExp(`<meta\\s+[^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  const reverseRe = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*>`, "i");
  return html.match(re)?.[1] ?? html.match(reverseRe)?.[1] ?? "";
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
      // Invalid schema is handled by missing expected types.
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
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesText(text, needle) {
  return text.toLowerCase().includes(String(needle).toLowerCase());
}

function toFinding(mapping, severity, issue) {
  return {
    id: mapping.id,
    query: mapping.query,
    targetPath: mapping.targetPath,
    severity,
    impact: mapping.impact,
    issue,
  };
}

function rankFindings(findings) {
  return [...findings].sort((a, b) => {
    const severity = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (severity !== 0) return severity;
    const impact = b.impact - a.impact;
    if (impact !== 0) return impact;
    return a.id.localeCompare(b.id);
  });
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
  const buildDir = argValue(argv, "--build-dir") ?? path.join(__dirname, "..", "build");
  const outPath = argValue(argv, "--out") ?? positionalArg(argv, ["--build-dir"]);
  const audit = auditBuiltHtml({ buildDir });
  const output = `${JSON.stringify(audit, null, 2)}\n`;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`BGSNL crawl audit written to ${outPath}`);
  } else {
    console.log(output);
  }

  const blocking = audit.findings.filter((finding) => (
    finding.severity === "critical" || finding.severity === "high"
  ));
  if (blocking.length > 0) process.exitCode = 1;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (require.main === module) main();

module.exports = {
  auditBuiltHtml,
  extractJsonLdTypes,
};
