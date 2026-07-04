const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  PRIORITY_QUERY_MAPPINGS,
  REGIONS,
  SEO_PAGES,
  getSeoPageForPath,
} = require("./seo-page-data");
const pastEventsArchive = require("../src/util/defines/past-events-archive.json");
const { auditBgsnlGeoReadiness } = require("./bgsnl-geo-query-benchmark");
const { generatePrerenderedHtml } = require("./generate-prerendered-html");

function readFixture(routePath) {
  const segments = routePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const filePath = segments.length === 0
    ? path.join(buildDir, "index.html")
    : path.join(buildDir, ...segments, "index.html");
  return fs.readFileSync(filePath, "utf8");
}

const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), "bgsnl-prerender-"));
const CITY_PAST_EVENT_PATHS = [
  "/amsterdam/events/past-events",
  "/breda/events/past-events",
  "/eindhoven/events/past-events",
  "/groningen/events/past-events",
  "/leiden_hague/events/past-events",
  "/leeuwarden/events/past-events",
  "/maastricht/events/past-events",
  "/rotterdam/events/past-events",
];
const CITY_QUICK_ANCHORS = [
  "/amsterdam/events/past-events",
  "/breda/events/past-events",
  "/eindhoven/events/past-events",
  "/groningen/events/past-events",
  "/leiden_hague/events/past-events",
  "/leeuwarden/events/past-events",
  "/maastricht/events/past-events",
  "/rotterdam/events/past-events",
];

fs.writeFileSync(
  path.join(buildDir, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <title>Bulgarian Society Netherlands</title>
    <meta name="description" content="Generic description">
    <meta property="og:title" content="Generic">
    <meta property="og:description" content="Generic">
    <meta property="og:url" content="https://www.bulgariansociety.nl">
    <meta name="twitter:title" content="Generic">
    <meta name="twitter:description" content="Generic">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
    <script type="module" crossorigin src="/static/index-test.js"></script>
  </head>
  <body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body>
</html>`,
  "utf8",
);

const PRERENDER_TEST_PAGES = [
  getSeoPageForPath("/"),
  getSeoPageForPath("/about"),
  getSeoPageForPath("/join-the-society"),
  getSeoPageForPath("/events/past-events"),
  getSeoPageForPath("/amsterdam"),
];

generatePrerenderedHtml({
  buildDir,
  pages: PRERENDER_TEST_PAGES,
});

const homeHtml = readFixture("/");
const aboutHtml = readFixture("/about");
const joinHtml = readFixture("/join-the-society");
const pastEventsHtml = readFixture("/events/past-events");
const amsterdamHtml = readFixture("/amsterdam");

assert.match(homeHtml, /<link rel="canonical" href="https:\/\/www\.bulgariansociety\.nl\/">/);
assert.match(homeHtml, /Quick answer/);
assert.match(homeHtml, /Bulgarian Society Netherlands \(BGSNL\)/);
assert.match(homeHtml, /"@type":"Organization"/);
assert.match(homeHtml, /"@type":"FAQPage"/);
assert.match(homeHtml, /"@type":"WebSite"/);

assert.match(aboutHtml, /<title>About Bulgarian Society Netherlands \| BGSNL<\/title>/);
assert.match(aboutHtml, /Radio Bulgaria/);
assert.match(aboutHtml, /aba\.government\.bg/);
assert.match(aboutHtml, /"@type":"AboutPage"/);
assert.match(aboutHtml, /<a href="\/join-the-society">/);

assert.match(joinHtml, /<title>Join Bulgarian Society Netherlands \| BGSNL<\/title>/);
assert.match(joinHtml, /Become a member/);
assert.match(joinHtml, /"@type":"FAQPage"/);

assert.match(pastEventsHtml, /Past Bulgarian Society Events \| BGSNL/);
assert.match(pastEventsHtml, new RegExp(`${pastEventsArchive.stats.totalEvents} archived public events`));
assert.match(pastEventsHtml, /archive-event-card/);
assert.match(pastEventsHtml, /archive-event-logo/);
assert.match(pastEventsHtml, /archive-event-context/);
assert.match(pastEventsHtml, /archive-event-detail-list/);
assert.match(pastEventsHtml, /archive-city-quick-links/);
assert.match(pastEventsHtml, /Past event/);
assert.match(pastEventsHtml, new RegExp(pastEventsArchive.events[0].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
for (const routePath of CITY_PAST_EVENT_PATHS) {
  assert.match(pastEventsHtml, new RegExp(routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
for (const anchor of CITY_QUICK_ANCHORS) {
  assert.match(pastEventsHtml, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.doesNotMatch(pastEventsHtml, /View event details/);
assert.doesNotMatch(pastEventsHtml, /\/event-details\//);
assert.doesNotMatch(pastEventsHtml, /Archive-only/);
assert.doesNotMatch(pastEventsHtml, /Earlier archive/);
assert.doesNotMatch(pastEventsHtml, /Venue not listed/);
assert.doesNotMatch(pastEventsHtml, /recovered from the archive export/);
assert.doesNotMatch(pastEventsHtml, /Completed event/);
assert.doesNotMatch(pastEventsHtml, /as a completed community event/);
assert.doesNotMatch(pastEventsHtml, /all-city-region-card/);
assert.doesNotMatch(pastEventsHtml, /archive-summary/);
assert.doesNotMatch(pastEventsHtml, /archive entry from/);
assert.doesNotMatch(pastEventsHtml, /event record from/);
assert.doesNotMatch(pastEventsHtml, /BGSNL Rotterdam (archive entry|event record) from 2025/);
assert.doesNotMatch(pastEventsHtml, /registrations/);
assert.match(pastEventsHtml, /"@type":"CollectionPage"/);
assert.match(pastEventsHtml, /"@type":"ItemList"/);
assert.match(pastEventsHtml, /"@type":"Event"/);

assert.match(amsterdamHtml, /Bulgarian Society Amsterdam/);
assert.match(amsterdamHtml, /<link rel="canonical" href="https:\/\/www\.bulgariansociety\.nl\/amsterdam">/);

generatePrerenderedHtml({
  buildDir,
  pages: PRERENDER_TEST_PAGES,
});

const rerenderedPastEventsHtml = readFixture("/events/past-events");
assert.match(rerenderedPastEventsHtml, new RegExp(`${pastEventsArchive.stats.totalEvents} archived public events`));
assert.match(rerenderedPastEventsHtml, /archive-event-card/);
assert.doesNotMatch(rerenderedPastEventsHtml, /Learn what BGSNL does/);

const audit = auditBgsnlGeoReadiness({ pages: SEO_PAGES, mappings: PRIORITY_QUERY_MAPPINGS });
for (const region of REGIONS) {
  assert.ok(
    PRIORITY_QUERY_MAPPINGS.some((mapping) => (
      mapping.id === `bulgarian-society-${region.slug}`
        && mapping.query === `Bulgarian Society ${region.name}`
        && mapping.targetPath === `/${region.slug}`
        && mapping.intent === "local-city"
    )),
    `missing priority GEO query mapping for ${region.name}`,
  );
}

const cityArchiveEvidenceAudit = auditBgsnlGeoReadiness({
  pages: SEO_PAGES,
  mappings: REGIONS.map((region) => ({
    id: `city-archive-evidence-${region.slug}`,
    query: `Bulgarian Society ${region.name} past events`,
    intent: "local-city-proof",
    impact: 4,
    targetPath: `/${region.slug}`,
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: [`Bulgarian Society ${region.name}`, "Quick answer"],
    requiredLinks: [
      `/${region.slug}/events/future-events`,
      `/${region.slug}/events/past-events`,
      "/join-the-society",
    ],
    requiredJsonLdTypes: ["WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    requiresCitation: true,
    minInternalLinks: 5,
  })),
});
assert.deepEqual(
  cityArchiveEvidenceAudit.findings.filter((finding) => (
    finding.severity === "critical" || finding.severity === "high"
  )),
  [],
);

assert.deepEqual(
  audit.findings.filter((finding) => finding.severity === "critical" || finding.severity === "high"),
  [],
);

console.log("SEO prerender self-test passed");
