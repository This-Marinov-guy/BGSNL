import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { administrationAreas, canAdminister } from "../src/util/administration.mjs";
import { browserApiPath } from "../src/util/auth/proxy-policy.mjs";

test("only national staff can access the monthly summary preview", () => {
  const area = administrationAreas.find(item => item.id === "monthly-summary");
  for (const role of ["admin", "super_admin", "national_board_member", "national_committee_member", "society_board_member"]) assert.equal(canAdminister(area, [role]), true);
  for (const role of ["member", "alumni", "regional_board_member", "committee_member", "support"]) assert.equal(canAdminister(area, [role]), false);
});
test("monthly summary proxy permits reading only", () => {
  const parts = ["dashboard", "monthly-summary", "2026-10"];
  assert.equal(browserApiPath(parts, "GET"), parts.join("/"));
  for (const method of ["POST", "PATCH", "DELETE"]) assert.equal(browserApiPath(parts, method), null);
  assert.equal(browserApiPath([...parts, "send"], "POST"), null);
});
test("monthly summary uses a sandboxed read-only preview with load feedback", async () => {
  const source = await readFile(new URL("../src/screens/userActions/MonthlySummary.jsx", import.meta.url), "utf8");
  assert.match(source, /sandbox=""/);
  assert.match(source, /label htmlFor="summary-month"/);
  assert.match(source, /LoadingSkeleton/);
  assert.match(source, /LoadErrorBanner/);
  assert.match(source, /Refresh preview/);
  assert.doesNotMatch(source, /Save news|Send email/);
});
