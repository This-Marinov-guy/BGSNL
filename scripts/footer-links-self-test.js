const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const footerFiles = [
  path.join(__dirname, "..", "src", "component", "footer", "Footer.jsx"),
  path.join(__dirname, "..", "src", "component", "footer", "FooterTwo.jsx"),
];
const regionsDesignSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "util", "defines", "REGIONS_DESIGN.js"),
  "utf8",
);

assert.match(regionsDesignSource, /export const REGION_DISPLAY_NAMES/);

for (const filePath of footerFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  assert.match(source, /REGIONS/);
  assert.match(source, /REGION_DISPLAY_NAMES/);
  assert.match(source, /footer-city-links/);
  assert.match(source, /City societies/);
  assert.match(source, /REGIONS\.map/);
  assert.match(source, /Bulgarian Society/);
  assert.match(source, /getRegionPath\(city\)/);
}

console.log("Footer links self-test passed");
