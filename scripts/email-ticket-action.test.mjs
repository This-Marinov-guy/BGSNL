import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";

const require = createRequire(import.meta.url);
await loadBindings();
const { code } = await transform(await readFile(new URL("../src/screens/eventActions/EmailTicketPreferences.jsx", import.meta.url), "utf8"), {
  filename: "EmailTicketPreferences.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
});
const exports = {};
vm.runInNewContext(code, { exports, require: name => {
  if (name === "react") return { useState: value => [value, () => {}] };
  if (["react/jsx-runtime", "prop-types", "yup"].includes(name)) return require(name);
  if (name === "formik") return { Form: "form" };
  if (name.endsWith("input-helpers")) return { buildSchemaExtraInputs: () => ({ schema: { shape: () => ({}) } }), constructInitialExtraFormValues: () => ({}), extraInputFieldName: index => `extra-${index}` };
  if (name.endsWith("PurchaseFormOptions")) return { PurchaseAddOns: "add-ons", PurchaseAdditionalInformation: "questions" };
  if (name.endsWith("IconlyIcons")) return { IconlyArrowRight: "arrow" };
  if (name.endsWith(".scss")) return { __esModule: true, default: {} };
  return { __esModule: true, default: name };
} });
const elements = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(elements) : [node, ...elements(node.props?.children)];
const label = node => typeof node === "string" ? node : Array.isArray(node) ? node.map(label).join("") : label(node?.props?.children ?? "");
function action({ free = true, memberFree = false, guest = false, paidAddon = false, pending = false } = {}) {
  const form = exports.default({ checkout: "test", details: { price: free || memberFree && !guest ? 0 : 8, guest, eventUrl: "/event", event: {
    isFree: free, isMemberFree: memberFree, addOns: { items: [{ _id: "meal", price: 3 }], isMandatory: false },
  } } });
  const view = form.props.children({ values: { addOns: paidAddon ? ["meal"] : [] }, setFieldValue() {}, isSubmitting: pending });
  return elements(view).find(node => node.type === "button" && node.props.type === "submit");
}
test("free confirmations show a ticket action; paid tickets and add-ons still show payment", () => {
  assert.equal(label(action()), "Get free ticket");
  assert.equal(label(action({ free: false, memberFree: true })), "Get free ticket");
  for (const options of [{ free: false }, { paidAddon: true }, { free: false, memberFree: true, guest: true }]) {
    assert.equal(label(action(options)), "Continue to payment");
  }
});
test("ticket creation disables resubmission and announces the correct pending action", () => {
  const button = action({ pending: true });
  assert.equal(label(button), "Creating ticket…");
  assert.equal(button.props.disabled, true);
  assert.equal(button.props["aria-busy"], true);
  assert.equal(label(action({ pending: true, paidAddon: true })), "Opening payment…");
});
