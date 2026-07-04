const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const archive = require("../src/util/defines/past-events-archive.json");

const pageSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "pages", "information", "PastEvents.jsx"),
  "utf8",
);

assert.ok(archive.events.length > 0, "past-events archive should contain event summaries");
assert.ok(archive.stats.totalEvents >= archive.events.length, "archive stats should describe event count");
assert.ok(
  archive.events.some((event) => event.sourceStatus === "archive-only"),
  "archive should keep older archive-only event summaries from partial exports",
);
assert.equal(
  archive.events.some((event) => event.id === "rotterdam-2025-04-05-movie-night"),
  false,
  "bad Rotterdam 2025 Movie Night entry should not be present",
);
assert.equal(
  archive.events.some((event) => event.region === "breda"),
  false,
  "archive should use canonical breda_tilburg region ids",
);
assert.match(pageSource, /PAST_EVENTS_ARCHIVE/);
assert.match(pageSource, /PAST_EVENTS_ARCHIVE_STATS/);
assert.match(pageSource, /REGIONS/);
assert.match(pageSource, /REGION_DISPLAY_NAMES/);
assert.match(pageSource, /Quick answer/);
assert.match(pageSource, /past-events-archive/);
assert.match(pageSource, /archive-city-quick-links/);
assert.match(pageSource, /getRegionPath/);
assert.match(pageSource, /path: `\$\{getRegionPath\(region\)\}\/events\/past-events`/);
assert.match(pageSource, /archive-event-card/);
assert.match(pageSource, /archive-event-detail-list/);
assert.match(pageSource, /archive-event-context/);
assert.match(pageSource, /archive-event-logo/);
assert.match(pageSource, /regionLogoPath/);
assert.match(pageSource, /event\.summary/);
assert.match(pageSource, /eventDetails/);
assert.match(pageSource, /Past event/);
assert.match(pageSource, /canonicalUrl="https:\/\/www\.bulgariansociety\.nl\/events\/past-events"/);
assert.match(pageSource, /\/events\/future-events/);
assert.match(pageSource, /\/join-the-society/);
assert.ok(
  pageSource.indexOf("past-events-gallery") < pageSource.indexOf("past-events-archive"),
  "past events gallery should render before the archive directory",
);
assert.doesNotMatch(pageSource, /View event details/);
assert.doesNotMatch(pageSource, /Archive-only/);
assert.doesNotMatch(pageSource, /Earlier archive/);
assert.doesNotMatch(pageSource, /Venue not listed/);
assert.doesNotMatch(pageSource, /recovered from the archive export/);
assert.doesNotMatch(pageSource, /Completed event/);
assert.doesNotMatch(pageSource, /as a completed community event/);
assert.doesNotMatch(pageSource, /event\.dateLabel/);
assert.doesNotMatch(pageSource, /archive-summary/);
assert.doesNotMatch(pageSource, /archive entry from/);
assert.doesNotMatch(pageSource, /event record from/);
assert.doesNotMatch(pageSource, /all-city-region-card/);
assert.doesNotMatch(pageSource, /city-region-links/);
assert.doesNotMatch(pageSource, /totalRegistrations/);
assert.doesNotMatch(pageSource, /registrationCount/);
assert.doesNotMatch(pageSource, /registrations/);

console.log("Past events page self-test passed");
