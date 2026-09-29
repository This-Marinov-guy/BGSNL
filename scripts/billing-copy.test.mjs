import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { parse } from "espree";
import { billingAction } from "../src/elements/subscriptions/subscription-checkout.mjs";

async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(jsx|js|mjs)$/.test(entry.name)) yield path;
  }
}
function inspect(node, violations) {
  if (!node || typeof node !== "object") return;
  const value = node.type === "JSXText" || node.type === "Literal" ? node.value
    : node.type === "TemplateElement" ? node.value.cooked : null;
  // Technical imports, provider host allowlists and identifiers are not copy.
  if (typeof value === "string" && /\bStripe\b/.test(value)) violations.push(value);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => inspect(child, violations));
    else if (value && typeof value === "object") inspect(value, violations);
  }
}

test("website copy names the payment provider only in billing terms", async () => {
  for (const directory of ["src/", "app/"]) for await (const file of files(new URL(`../${directory}`, import.meta.url))) {
    if (file.pathname.endsWith("/elements/legals/Terms.jsx")) continue;
    const source = await readFile(file, "utf8");
    if (!/\bStripe\b/.test(source)) continue;
    const violations = [];
    inspect(parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } }), violations);
    assert.deepEqual(violations, [], file.pathname);
  }
});

test("late payments lead to support rather than another payment", () => {
  assert.equal(billingAction({ status: "locked", subscription: { id: "sub_old", customerId: "cus_old", status: "canceled" } }, "late_payment_review"), "support");
});
