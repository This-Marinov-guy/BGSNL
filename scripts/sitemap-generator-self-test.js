const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { archiveEvents } = require("./generate-sitemap");

const source = fs.readFileSync(path.join(__dirname, "generate-sitemap.js"), "utf8");

assert.match(source, /headers:\s*SITEMAP_REQUEST_HEADERS/);
assert.match(source, /past-events-archive\.json/);
assert.match(source, /addUniqueUrl/);
assert.match(source, /archiveEvents/);
assert.deepEqual(
  archiveEvents(),
  [],
  "archived events should live on the past-events directory instead of thin event-detail sitemap routes",
);

console.log("Sitemap generator self-test passed");
