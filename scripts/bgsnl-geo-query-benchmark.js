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

function auditBgsnlGeoReadiness({
  pages = SEO_PAGES,
  mappings = PRIORITY_QUERY_MAPPINGS,
} = {}) {
  const findings = [];
  const results = mappings.map((mapping) => {
    const page = pages.find((item) => item.path === mapping.targetPath);
    if (!page) {
      const finding = toFinding(mapping, "critical", `missing target page ${mapping.targetPath}`);
      findings.push(finding);
      return {
        id: mapping.id,
        query: mapping.query,
        targetPath: mapping.targetPath,
        impact: mapping.impact,
        engines: mapping.engines,
        answerFirst: false,
        cited: false,
        internalLinks: 0,
        jsonLdTypes: [],
        missingPhrases: mapping.requiredPhrases ?? [],
        missingLinks: mapping.requiredLinks ?? [],
        missingJsonLdTypes: mapping.requiredJsonLdTypes ?? [],
      };
    }

    const text = pageText(page);
    const jsonLdTypes = jsonLdTypesForPage(page);
    const internalLinks = new Set((page.internalLinks ?? []).map((link) => link.href)).size;
    const missingPhrases = (mapping.requiredPhrases ?? []).filter((phrase) => !includesText(text, phrase));
    const missingLinks = (mapping.requiredLinks ?? []).filter((link) => !includesText(text, link));
    const missingJsonLdTypes = (mapping.requiredJsonLdTypes ?? []).filter((type) => !jsonLdTypes.includes(type));
    const answerFirst = includesText(text, "Quick answer");
    const cited = hasCitationSignal(page, mapping.requiredLinks ?? []);

    for (const phrase of missingPhrases) {
      findings.push(toFinding(mapping, "high", `missing answer-ready phrase: ${phrase}`));
    }
    for (const link of missingLinks) {
      findings.push(toFinding(mapping, "high", `missing required internal/source link: ${link}`));
    }
    for (const type of missingJsonLdTypes) {
      findings.push(toFinding(mapping, "high", `missing structured data type: ${type}`));
    }
    if (mapping.requiresAnswerFirst && !answerFirst) {
      findings.push(toFinding(mapping, "high", "page does not expose an answer-first Quick answer block"));
    }
    if (mapping.requiresCitation && !cited) {
      findings.push(toFinding(mapping, "high", "page does not expose source citation signals"));
    }
    if (mapping.minInternalLinks && internalLinks < mapping.minInternalLinks) {
      findings.push(toFinding(mapping, "medium", `only ${internalLinks} internal links found; expected at least ${mapping.minInternalLinks}`));
    }

    return {
      id: mapping.id,
      query: mapping.query,
      targetPath: mapping.targetPath,
      impact: mapping.impact,
      engines: mapping.engines,
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
    engines: [
      { id: "google", type: "search" },
      { id: "bing", type: "search" },
      { id: "chatgpt", type: "ai-answer" },
      { id: "perplexity", type: "ai-answer" },
      { id: "gemini", type: "ai-answer" },
    ],
    results,
    findings: rankFindings(findings),
  };
}

function pageText(page) {
  return [
    "Quick answer",
    page.title,
    page.h1,
    page.description,
    page.answer,
    ...(page.keywords ?? []),
    ...(page.body ?? []),
    ...(page.internalLinks ?? []).flatMap((link) => [link.href, link.label]),
    ...(page.citations ?? []).flatMap((source) => [source.name, source.url, source.label]),
    ...(page.faq ?? []).flatMap((item) => [item.question, item.answer]),
    page.archiveStats
      ? `${page.archiveStats.totalEvents} archived public events across ${page.archiveStats.totalRegions} regions`
      : "",
    ...(page.archiveEvents ?? []).flatMap((event) => [
      event.title,
      event.summary,
      event.regionName,
      event.date,
      event.location,
      ...(event.tags ?? []),
    ]),
  ].join("\n");
}

function jsonLdTypesForPage(page) {
  const types = new Set(["BreadcrumbList", page.schemaType || "WebPage"]);
  if (page.includeOrganization) types.add("Organization");
  if (page.includeWebSite) types.add("WebSite");
  if ((page.faq ?? []).length > 0) types.add("FAQPage");
  if ((page.archiveEvents ?? []).length > 0) {
    types.add("ItemList");
    types.add("Event");
  }
  return [...types].sort();
}

function hasCitationSignal(page, requiredLinks) {
  const citationUrls = new Set((page.citations ?? []).map((source) => source.url));
  if (citationUrls.size > 0) return true;
  return requiredLinks.some((link) => /^https:\/\//i.test(link) && citationUrls.has(link));
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
  const outPath = argValue(argv, "--out") ?? positionalArg(argv);
  const audit = auditBgsnlGeoReadiness();
  const output = `${JSON.stringify(audit, null, 2)}\n`;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`BGSNL GEO query benchmark written to ${outPath}`);
  } else {
    console.log(output);
  }

  const blocking = audit.findings.filter((finding) => (
    finding.severity === "critical" || finding.severity === "high"
  ));
  if (blocking.length > 0) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  auditBgsnlGeoReadiness,
  jsonLdTypesForPage,
  rankFindings,
};
