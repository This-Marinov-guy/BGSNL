import assert from "node:assert/strict";
import test from "node:test";
import { eventAverageComparison } from "./event-average-comparison.mjs";

test("event averages compare regional values with a national baseline", () => {
  assert.equal(eventAverageComparison(13, 10, false), "+30% vs national");
  assert.equal(eventAverageComparison(8, 10, false), "-20% vs national");
  assert.equal(eventAverageComparison(10, 10, false), "0% vs national");
  assert.equal(eventAverageComparison(10, 10, true), null);
  assert.equal(eventAverageComparison(0, 0, false), "0% vs national");
  assert.equal(eventAverageComparison(2, 0, false), "National average is zero");
  assert.equal(eventAverageComparison(null, 10, false), "No comparable event data");
  assert.equal(eventAverageComparison(2, null, false), "No national baseline");
});
