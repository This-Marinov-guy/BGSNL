import assert from "node:assert/strict";
import test from "node:test";
import { formatDisplayDate, formatDisplayDateTime } from "./display-date.mjs";

test("displays date-only values without a timezone shift", () => {
  assert.equal(formatDisplayDate("2026-10-13"), "13-10-2026");
  assert.equal(formatDisplayDate("2026-02-29"), "");
});

test("displays timestamps in Amsterdam time with a four-digit year", () => {
  assert.equal(formatDisplayDateTime("2026-07-01T22:30:00Z"), "02-07-2026 00:30");
  assert.equal(formatDisplayDateTime("2026-12-01T22:30:00Z"), "01-12-2026 23:30");
});

test("leaves missing and invalid dates empty", () => {
  assert.equal(formatDisplayDate(null), "");
  assert.equal(formatDisplayDateTime("invalid"), "");
});
