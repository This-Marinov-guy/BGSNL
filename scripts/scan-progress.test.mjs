import test from "node:test";
import assert from "node:assert/strict";
import { estimateScanProgress } from "../src/util/functions/scan-progress.mjs";

test("scan estimate uses only 20% steps and caps possible patterns at 60%", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 20].map(patterns => estimateScanProgress({ patterns })), [0, 20, 40, 60, 60, 60]);
  assert.equal(estimateScanProgress({ patterns: -1 }), 0);
});
test("80% requires a decoding attempt and 100% requires a decoded code", () => {
  assert.equal(estimateScanProgress({ decodeAttempted: true }), 80);
  assert.equal(estimateScanProgress({ decoded: true }), 100);
  assert.equal(estimateScanProgress({ patterns: 10, decodeAttempted: true }), 80);
});
