const assert = require("node:assert/strict");

const {
  auditLiveHtml,
  inspectHtml,
  rankFindings,
} = require("./bgsnl-live-html-audit");

const goodHtml = `<!doctype html>
<html lang="en">
  <head>
    <title>Past Bulgarian Society Events | BGSNL</title>
    <meta name="description" content="Browse the BGSNL past events archive.">
    <link rel="canonical" href="https://www.bulgariansociety.nl/events/past-events">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","itemListElement":[{"@type":"ListItem","item":{"@type":"Event","name":"Dinner"}}]}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>
  </head>
  <body>
    <div id="root">
      <main data-bgsnl-prerender="true">
        <p>Quick answer</p>
        <h1>Past Bulgarian Society events</h1>
        <p>${"Bulgarian Society Netherlands event archive ".repeat(45)}</p>
        <a href="/events/future-events">Upcoming events</a>
        <a href="/join-the-society">Join BGSNL</a>
      </main>
    </div>
  </body>
</html>`;

const staleSpaHtml = `<!doctype html>
<html>
  <head>
    <title>Bulgarian Society Netherlands</title>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
  </head>
  <body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body>
</html>`;

const healthy = inspectHtml({
  routePath: "/events/past-events",
  url: "https://www.bulgariansociety.nl/events/past-events",
  html: goodHtml,
  expectedTitle: "Past Bulgarian Society Events | BGSNL",
  requiredPhrases: ["Quick answer", "Past Bulgarian Society events"],
  requiredJsonLdTypes: ["CollectionPage", "ItemList", "Event", "FAQPage"],
  minWordCount: 120,
});

assert.equal(healthy.hasPrerenderRoot, true);
assert.equal(healthy.wordCount >= 120, true);
assert.deepEqual(healthy.findings, []);

const stale = inspectHtml({
  routePath: "/events/past-events",
  url: "https://www.bulgariansociety.nl/events/past-events",
  html: staleSpaHtml,
  expectedTitle: "Past Bulgarian Society Events | BGSNL",
  requiredPhrases: ["Quick answer", "Past Bulgarian Society events"],
  requiredJsonLdTypes: ["CollectionPage", "ItemList", "Event", "FAQPage"],
  minWordCount: 120,
});

assert.equal(stale.hasPrerenderRoot, false);
assert.deepEqual(
  stale.findings.map((finding) => finding.issue),
  [
    "live HTML is missing prerendered crawler content",
    "live HTML title does not match expected route title",
    "live HTML canonical does not match https://www.bulgariansociety.nl/events/past-events",
    "live HTML missing answer-ready phrase: Quick answer",
    "live HTML missing answer-ready phrase: Past Bulgarian Society events",
    "live HTML missing JSON-LD type: CollectionPage",
    "live HTML missing JSON-LD type: ItemList",
    "live HTML missing JSON-LD type: Event",
    "live HTML missing JSON-LD type: FAQPage",
    "live HTML has 12 words; expected at least 120",
  ],
);

const sorted = rankFindings([
  { severity: "medium", impact: 5, id: "b" },
  { severity: "critical", impact: 1, id: "c" },
  { severity: "high", impact: 5, id: "a" },
]);
assert.deepEqual(sorted.map((finding) => finding.id), ["c", "a", "b"]);

(async () => {
  const audit = await auditLiveHtml({
    routes: [{
      id: "past-events",
      routePath: "/events/past-events",
      impact: 4,
      expectedTitle: "Past Bulgarian Society Events | BGSNL",
      requiredPhrases: ["Quick answer"],
      requiredJsonLdTypes: ["CollectionPage"],
      minWordCount: 120,
    }],
    siteUrl: "https://www.bulgariansociety.nl",
    fetchHtml: async () => staleSpaHtml,
  });

  assert.equal(audit.results.length, 1);
  assert.equal(audit.findings[0].severity, "critical");
  assert.equal(audit.summary.criticalHighFindings, 5);
  console.log("BGSNL live HTML audit self-test passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
