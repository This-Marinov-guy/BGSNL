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

function harness({ subscription = { id: "sub_test", customerId: "cus_test", status: "active", priceId: "price_current" }, response, ...props } = {}) {
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
  const render = () => { cursor = 0; return exports.default({ subscription, user, ...props }); };
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

test("Settings can place Switch in its own row without duplicating billing controls", () => {
  assert.deepEqual(elements(harness({ hideSwitch: true }).render()).filter(node => node.type === "button").map(label), ["Cancel", "Payments"]);
  const h = harness({ switchOnly: true });
  assert.deepEqual(elements(h.render()).filter(node => node.type === "button").map(label), ["Switch"]);
  button(h.render(), "Switch").props.onClick();
  assert.equal(elements(h.render()).some(node => node.type === "app-modal" && node.props.title === "Switch subscription"), true);
  assert.equal(h.calls.length, 0);
});

test("ended subscriptions and customer-only records show Payments without Cancel or Switch", () => {
  for (const subscription of [{ customerId: "cus_test" }, { id: "sub_test", status: "canceled", customerId: "cus_test" }, { id: "sub_test", status: "incomplete_expired", customerId: "cus_test" }]) {
    assert.deepEqual(elements(harness({ subscription }).render()).filter(node => node.type === "button").map(label), ["Payments"]);
  }
});

function billingHarness(billing = null) {
  const exports = {};
  vm.runInNewContext(billingCode, { exports, require: name => {
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("subscription-checkout.mjs")) return policy;
    if (name.endsWith("BillingAttentionProvider")) return { useBillingAttention: () => billing };
    if (name.endsWith("SubscriptionStart")) return { __esModule: true, default: "start-subscription" };
    if (name.endsWith("AlumniRegistrationButton")) return { __esModule: true, default: "tier-up" };
    if (name.endsWith("SubscriptionManage")) return { __esModule: true, default: "payments" };
    if (name.endsWith("subscriptions.module.scss")) return { __esModule: true, default: {} };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return user => elements(exports.default({ user }));
}

test("BillingActions combines the existing Start modal with Payments when a Stripe customer exists", () => {
  const render = billingHarness();
  for (const subscription of [{ customerId: "cus_test" }, { id: "sub_old", customerId: "cus_test", status: "canceled" }]) {
    const children = render({ status: "active", subscription });
    assert.deepEqual(children.filter(node => ["start-subscription", "payments"].includes(node.type)).map(node => node.type), ["start-subscription", "payments"]);
    assert.equal(children.find(node => node.type === "payments").props.portalOnly, true);
  }
  const noCustomer = render({ status: "active" });
  assert.equal(noCustomer.some(node => node.type === "payments"), false);
  assert.equal(noCustomer.some(node => node.type === "start-subscription"), true);
});

test("unknown or loading subscription state only keeps Payments with a customer ID", () => {
  for (const billing of [{ loading: true }, { notice: { reason: "unavailable" } }, null]) {
    for (const status of ["active", "canceled"]) {
      const user = { status: "active", billingVerificationUnavailable: true, subscription: { id: "sub_test", customerId: "cus_test", status } };
      const children = billingHarness(billing)(user);
      assert.equal(children.some(node => node.type === "start-subscription"), false);
      assert.equal(children.find(node => node.type === "payments").props.portalOnly, true);
      assert.equal(billingHarness(billing)({ ...user, subscription: { id: "sub_test", status } }).some(node => node.type === "payments"), false);
    }
  }
});

test("Tier 0 Alumni get Tier up and Payments, respecting unavailable and loading states", () => {
  const user = { status: "active", isAlumni: true, tier: 0, subscription: { customerId: "cus_test" } };
  const children = billingHarness()(user);
  assert.equal(label(children.find(node => node.type === "tier-up")), "Tier up");
  assert.equal(children.some(node => node.type === "start-subscription"), false);
  assert.equal(children.find(node => node.type === "payments").props.portalOnly, true);
  for (const billing of [{ loading: true }, { notice: { reason: "unavailable" } }]) {
    assert.equal(billingHarness(billing)(user).some(node => node.type === "tier-up"), false);
  }
  assert.equal(billingHarness()({ ...user, isAlumni: false }).some(node => node.type === "tier-up"), false);
});

test("confirmed subscription problems keep the full billing controls", () => {
  for (const reason of ["payment_failed", "payment_pending", "subscription_paused"]) {
    const children = billingHarness({ notice: { reason } })({ status: "locked", billingLocked: true,
      subscription: { id: "sub_test", customerId: "cus_test", status: "past_due" } });
    assert.equal(children.find(node => node.type === "payments").props.portalOnly, undefined);
    assert.equal(children.some(node => node.type === "start-subscription"), false);
  }
});

test("Payments stays available for restricted accounts with a customer ID", () => {
  const children = billingHarness()({ status: "frozen", subscription: { customerId: "cus_test" } });
  assert.equal(children.find(node => node.type === "payments").props.portalOnly, true);
});

test("a subscription without a customer ID does not show Payments", () => {
  const h = harness({ subscription: { id: "sub_test", status: "active" } });
  assert.deepEqual(elements(h.render()).filter(node => node.type === "button").map(label), ["Cancel", "Switch"]);
});

test("Resolve is portal-only and opens the customer portal without a mutation action", async () => {
  const h = harness({ portalOnly: true, portalLabel: "Resolve" });
  assert.deepEqual(elements(h.render()).filter(node => node.type === "button").map(label), ["Resolve"]);
  await button(h.render(), "Resolve").props.onClick();
  assert.equal(h.calls[0][0], "payment/subscription/customer-portal");
  assert.deepEqual(Object.keys(h.calls[0][2]), ["url"]);
  assert.equal(h.redirects[0], "https://billing.stripe.com/p/session/test");
});

test("Cancel and Keep subscription make no request; only confirmation opens cancellation", async () => {
  const h = harness();
  button(h.render(), "Cancel").props.onClick();
  assert.equal(h.calls.length, 0);
  assert.ok(elements(h.render()).some(node => node.type === "app-modal" && node.props.title === "Cancel your subscription?"));
  button(h.render(), "Keep subscription").props.onClick();
  assert.equal(h.calls.length, 0);
  button(h.render(), "Cancel").props.onClick();
  await button(h.render(), "Review cancellation").props.onClick();
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


test("scheduled cancellation hides Cancel for both period-end and explicit dates", () => {
  for (const cancellation of [{ cancelAtPeriodEnd: true }, { cancelAt: "2026-10-31T23:00:00Z" }]) {
    const h = harness({ subscription: { id: "sub_test", customerId: "cus_test", status: "active", ...cancellation } });
    assert.equal(button(h.render(), "Cancel"), undefined);
    assert.ok(button(h.render(), "Payments"));
    assert.equal(h.calls.length, 0);
  }
});

test("ended subscriptions with an ID request renewal; new accounts retain Start", () => {
  const render = billingHarness({ notice: { reason: "subscription_ended" } });
  const ended = render({ status: "locked", subscription: { id: "sub_old", status: "canceled", priceId: "price_previous" } });
  assert.equal(ended.find(node => node.type === "start-subscription").props.renewal, true);
  const fresh = billingHarness()({ status: "active" });
  assert.equal(fresh.find(node => node.type === "start-subscription").props.renewal, false);
});

test("scheduled end dates prefer explicit cancellation and tolerate missing or invalid data", () => {
  assert.equal(policy.scheduledCancellationDate({ cancelAtPeriodEnd: true, currentPeriodEnd: "2026-10-01T12:00:00Z" }).toISOString(), "2026-10-01T12:00:00.000Z");
  assert.equal(policy.scheduledCancellationDate({ cancelAtPeriodEnd: true, cancelAt: "2026-09-30T12:00:00Z", currentPeriodEnd: "2026-10-01T12:00:00Z" }).toISOString(), "2026-09-30T12:00:00.000Z");
  assert.equal(policy.scheduledCancellationDate({ cancelAtPeriodEnd: true, cancelAt: "invalid", currentPeriodEnd: "2026-10-01T12:00:00Z" }).toISOString(), "2026-10-01T12:00:00.000Z");
  for (const subscription of [undefined, {}, { currentPeriodEnd: "2026-10-01" }, { status: "canceled", cancelAtPeriodEnd: true }, { cancelAtPeriodEnd: true, currentPeriodEnd: "invalid" }]) {
    assert.equal(policy.scheduledCancellationDate(subscription), null);
  }
});


test("the account danger banner shows the cancellation date only while paid access remains", async () => {
  const { code: noticeCode } = await transform(await readFile(new URL("../src/elements/subscriptions/SubscriptionCancellationNotice.jsx", import.meta.url), "utf8"), {
    filename: "SubscriptionCancellationNotice.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
  });
  const exports = {};
  vm.runInNewContext(noticeCode, { exports, require: name => {
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("subscription-checkout.mjs")) return policy;
    if (name.endsWith("IconlyIcons")) return { IconlyDanger: "warning-icon" };
    if (name.endsWith("subscriptions.module.scss")) return { __esModule: true, default: {} };
    throw new Error(`Unexpected import: ${name}`);
  } });
  const user = { status: "active", hasBenefits: true, subscription: { status: "active", cancelAtPeriodEnd: true, currentPeriodEnd: "2026-10-31T23:00:00Z" } };
  assert.match(label(exports.default({ user })), /1 November 2026/);
  assert.match(label(exports.default({ user })), /keep your paid benefits until then/);
  assert.equal(exports.default({ user }).props.role, "alert");
  assert.match(label(exports.default({ user: { ...user, subscription: { status: "canceled", currentPeriodEnd: "2026-10-31T23:00:00Z" } } })), /1 November 2026/);
  for (const changed of [{ ...user, hasBenefits: false }, { ...user, status: "locked" }, { ...user, subscription: { status: "canceled", cancelAtPeriodEnd: true } }, { ...user, subscription: { status: "active" } }, { ...user, subscription: { status: "canceled", currentPeriodEnd: "2026-09-01T00:00:00Z" } }]) {
    assert.equal(exports.default({ user: changed }), null);
  }
});
