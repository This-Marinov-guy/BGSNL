import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const root = new URL("../", import.meta.url);

function renderDates(timeZone, locale) {
  return JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", `
    import moment from "moment-timezone";
    import { getEventDateTimePresentation, formatCorrectedDateTime } from "./src/util/functions/date.js";
    moment.locale(${JSON.stringify(locale)});
    console.log(JSON.stringify({
      summer: getEventDateTimePresentation("2026-09-29T12:35:00Z"),
      winter: getEventDateTimePresentation("2026-12-29T12:35:00Z"),
      midnight: getEventDateTimePresentation("2026-09-29T23:35:00Z"),
      wallTime: getEventDateTimePresentation("2026-09-29T14:35:00"),
      corrected: getEventDateTimePresentation("2026-09-29T12:35:00Z", "2026-09-30T12:35:00Z"),
      correctedLabel: formatCorrectedDateTime("2026-09-30T12:35:00Z"),
      empty: getEventDateTimePresentation(null),
      invalid: formatCorrectedDateTime("2026-99-99"),
    }));
  `], {
    cwd: root,
    env: { ...process.env, TZ: timeZone, NODE_NO_WARNINGS: "1" },
    encoding: "utf8",
  }));
}

test("event text matches server rendering across visitor timezones and locales", () => {
  const server = renderDates("UTC", "en");
  for (const zone of ["Europe/Amsterdam", "America/New_York", "Asia/Tokyo"]) {
    assert.deepEqual(renderDates(zone, "bg"), server, zone);
  }
  assert.equal(server.summer.label, "29th Sep 14:35");
  assert.equal(server.winter.label, "29th Dec 13:35");
  assert.equal(server.midnight.label, "30th Sep 01:35");
  assert.equal(server.wallTime.label, "29th Sep 14:35");
  assert.equal(server.wallTime.value, "2026-09-29T12:35:00.000Z");
  assert.equal(server.corrected.isUpdated, true);
  assert.equal(server.corrected.label, "30th Sep 14:35");
  assert.equal(server.correctedLabel, "30 - 09 02:35 pm");
  assert.equal(server.empty.label, "");
  assert.equal(server.invalid, "");
});
