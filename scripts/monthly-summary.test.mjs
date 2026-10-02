import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { administrationAreas, canAdminister } from "../src/util/administration.mjs";
import { browserApiPath } from "../src/util/auth/proxy-policy.mjs";

test("only national staff can access the monthly summary editor", () => {
  const area = administrationAreas.find(item => item.id === "monthly-summary");
  for (const role of ["admin", "super_admin", "national_board_member", "national_committee_member", "society_board_member"]) assert.equal(canAdminister(area, [role]), true);
  for (const role of ["member", "alumni", "regional_board_member", "committee_member", "support"]) assert.equal(canAdminister(area, [role]), false);
});
test("monthly editor proxy permits only reading and updating news, not sending", () => {
  const parts = ["dashboard", "monthly-summary", "2026-10"];
  for (const method of ["GET", "PATCH"]) assert.equal(browserApiPath(parts, method), parts.join("/"));
  for (const method of ["POST", "DELETE"]) assert.equal(browserApiPath(parts, method), null);
  assert.equal(browserApiPath([...parts, "send"], "POST"), null);
});
test("editor uses sandboxed preview, labelled fields, skeletons and explicit save feedback", async () => {
  const source = await readFile(new URL("../src/screens/userActions/MonthlySummary.jsx", import.meta.url), "utf8");
  assert.match(source, /sandbox=""/);
  assert.match(source, /label htmlFor="news-title"/);
  assert.match(source, /LoadingSkeleton/);
  assert.match(source, /LoadErrorBanner/);
  assert.match(source, /News saved for the scheduled monthly email/);
  assert.match(source, /revision: summary.revision/);
});
