import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
import * as policy from "../src/elements/subscriptions/subscription-checkout.mjs";

const require = createRequire(import.meta.url);
const filename = "src/elements/ui/buttons/SubscriptionManage.jsx";
await loadBindings();
const { code } = await transform(await readFile(new URL(`../${filename}`, import.meta.url), "utf8"), {
  filename, jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});
const { code: billingCode } = await transform(await readFile(new URL("../src/elements/subscriptions/BillingActions.jsx", import.meta.url), "utf8"), {
  filename: "BillingActions.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
});

function harness({ subscription = { id: "sub_test", status: "active", priceId: "price_current" }, response } = {}) {
  const slots = [];
  let cursor = 0;
  const calls = [];
  const redirects = [];
  const reloads = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback: callback => callback,
  };
  const sendRequest = async (...args) => {
    calls.push(args);
    return response ? response(...args) : { url: "https://billing.stripe.com/p/session/test" };
  };
  const exports = {};
  vm.runInNewContext(code, { exports, URL, window: { location: { href: "https://bulgariansociety.nl/user#settings", origin: "https://bulgariansociety.nl", assign: url => redirects.push(url), reload: () => reloads.push(true) } },
    require: name => {
      if (name === "react") return hooks;
      if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
      if (name.endsWith("http-hook")) return { useHttpClient: () => ({ sendRequest }) };
      if (name.endsWith("subscription-checkout.mjs")) return policy;
      if (name.endsWith("SubscriptionStart")) return { SubscriptionCheckoutForm: "checkout-form" };
      if (name.endsWith("AppModal")) return { __esModule: true, default: "app-modal" };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const user = { status: "active", roles: ["member"], subscription };
  const render = () => { cursor = 0; return exports.default({ subscription, user }); };
  return { render, calls, redirects, reloads, user };
}

function elements(node, { hidden = false } = {}) {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(child => elements(child, { hidden }));
  if (typeof node !== "object") return [];
  if (node.type === "app-modal" && !node.props.open && !hidden) return [];
  return [node, ...elements(node.props?.children, { hidden }), ...elements(node.props?.actions, { hidden })];
}
const label = node => Array.isArray(node) ? node.map(label).join("") : typeof node === "string" ? node : label(node?.props?.children ?? "");
const button = (tree, name) => elements(tree).find(node => node.type === "button" && label(node) === name);

test("active billing renders Cancel, Switch and Payments in the requested order", () => {
  const h = harness();
  assert.deepEqual(elements(h.render()).filter(node => node.type === "button").map(label), ["Cancel", "Switch", "Payments"]);
});

test("ended subscriptions and customer-only records show Payments without Cancel or Switch", () => {
  for (const subscription of [{ customerId: "cus_test" }, { id: "sub_test", status: "canceled", customerId: "cus_test" }, { id: "sub_test", status: "incomplete_expired", customerId: "cus_test" }]) {
    assert.deepEqual(elements(harness({ subscription }).render()).filter(node => node.type === "button").map(label), ["Payments"]);
  }
});

test("BillingActions combines the existing Start modal with Payments when a Stripe customer exists", () => {
  const exports = {};
  vm.runInNewContext(billingCode, { exports, require: name => {
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("subscription-checkout.mjs")) return policy;
    if (name.endsWith("BillingAttentionProvider")) return { useBillingAttention: () => null };
    if (name.endsWith("SubscriptionStart")) return { __esModule: true, default: "start-subscription" };
    if (name.endsWith("SubscriptionManage")) return { __esModule: true, default: "payments" };
    if (name.endsWith("subscriptions.module.scss")) return { __esModule: true, default: {} };
    throw new Error(`Unexpected import: ${name}`);
  } });
  for (const subscription of [{ customerId: "cus_test" }, { id: "sub_old", customerId: "cus_test", status: "canceled" }]) {
    const children = elements(exports.default({ user: { status: "active", subscription } }));
    assert.deepEqual(children.filter(node => ["start-subscription", "payments"].includes(node.type)).map(node => node.type), ["start-subscription", "payments"]);
    assert.equal(children.find(node => node.type === "payments").props.canCancel, false);
  }
  const noCustomer = elements(exports.default({ user: { status: "active" } }));
  assert.equal(noCustomer.some(node => node.type === "payments"), false);
  assert.equal(noCustomer.some(node => node.type === "start-subscription"), true);
});

test("Cancel and Keep subscription make no request; only confirmation opens cancellation", async () => {
  const h = harness();
  button(h.render(), "Cancel").props.onClick();
  assert.equal(h.calls.length, 0);
  assert.ok(elements(h.render()).some(node => node.type === "app-modal" && node.props.title === "Cancel your subscription?"));
  button(h.render(), "Keep subscription").props.onClick();
  assert.equal(h.calls.length, 0);
  button(h.render(), "Cancel").props.onClick();
  await button(h.render(), "Continue to Stripe").props.onClick();
  assert.equal(h.calls[0][0], "payment/subscription/customer-portal");
  assert.equal(h.calls[0][2].action, "cancel");
  assert.equal(h.redirects.length, 1);
});

test("Switch opens the existing chooser with the current plan excluded and submits only to change", async () => {
  const h = harness();
  button(h.render(), "Switch").props.onClick();
  assert.equal(h.calls.length, 0);
  const form = elements(h.render()).find(node => node.type === "checkout-form");
  assert.equal(form.props.currentPriceId, "price_current");
  assert.equal(form.props.initialType, "member");
  await form.props.onCheckout("price_new");
  assert.equal(h.calls[0][0], "payment/subscription/change");
  assert.equal(h.calls[0][2].itemId, "price_new");
});

test("Payments requests the generic customer portal without a plan or switching action", async () => {
  const h = harness();
  await button(h.render(), "Payments").props.onClick();
  assert.equal(h.calls[0][0], "payment/subscription/customer-portal");
  assert.deepEqual(Object.keys(h.calls[0][2]), ["url"]);
  assert.equal(h.redirects[0], "https://billing.stripe.com/p/session/test");
});

test("a confirmed same-programme switch refreshes the profile without opening Stripe", async () => {
  const h = harness({ response: async () => ({ updated: true }) });
  button(h.render(), "Switch").props.onClick();
  const form = elements(h.render()).find(node => node.type === "checkout-form");
  await form.props.onCheckout("price_new");
  assert.equal(h.reloads.length, 1);
  assert.equal(h.redirects.length, 0);
});

test("blocked subscriptions retain Payments and explain why the switch chooser is unavailable", () => {
  const h = harness();
  h.user.billingLocked = true;
  button(h.render(), "Switch").props.onClick();
  assert.equal(elements(h.render()).some(node => node.type === "checkout-form"), false);
  assert.match(label(h.render()), /Resolve any payment issue/);
  assert.equal(h.calls.length, 0);
});

test("failed portal requests remain recoverable without redirecting", async () => {
  const h = harness({ response: async () => ({ url: "https://untrusted.example/" }) });
  await button(h.render(), "Payments").props.onClick();
  assert.equal(h.redirects.length, 0);
  assert.match(label(h.render()), /We could not open payments/);
  assert.equal(button(h.render(), "Payments").props.disabled, false);
});

test("a pending portal request blocks repeated clicks", async () => {
  let finish;
  const h = harness({ response: () => new Promise(resolve => { finish = resolve; }) });
  const click = button(h.render(), "Payments").props.onClick;
  const first = click();
  await click();
  assert.equal(h.calls.length, 1);
  assert.equal(button(h.render(), "Opening payments…").props.disabled, true);
  finish({ url: "https://billing.stripe.com/p/session/test" });
  await first;
});
