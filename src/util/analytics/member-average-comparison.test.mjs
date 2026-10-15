import assert from "node:assert/strict";
import test from "node:test";
import { memberAverageComparison } from "./member-average-comparison.mjs";

test("member average comparison uses whole signed percentages and handles missing baselines", () => {
  assert.deepEqual(memberAverageComparison(16.4, 12.3, false), { label: "+33% above National", tone: "up" });
  assert.deepEqual(memberAverageComparison(8.1, 12.3, false), { label: "-34% below National", tone: "down" });
  assert.deepEqual(memberAverageComparison(12.3, 12.3, false), { label: "0% vs National", tone: "neutral" });
  assert.deepEqual(memberAverageComparison(12.3, 12.3, true), { label: "National baseline", tone: "neutral" });
  assert.deepEqual(memberAverageComparison(3, 0, false), { label: "No National baseline", tone: "neutral" });
  assert.deepEqual(memberAverageComparison(null, 4, false), { label: "No data for this period", tone: "neutral" });
});
