import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
import * as policy from "../src/elements/subscriptions/subscription-checkout.mjs";

const require = createRequire(import.meta.url);
await loadBindings();
const { code } = await transform(await readFile(new URL("../src/elements/subscriptions/SubscriptionStart.jsx", import.meta.url), "utf8"), {
  filename: "SubscriptionStart.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
});
const plans = [
  { priceId: "price_member6", type: "member", period: 6 }, { priceId: "price_member12", type: "member", period: 12 },
  ...[1, 2, 3, 4].map(tier => ({ priceId: `price_alumni${tier}`, type: "alumni", tier, period: 1 })),
].map(plan => ({ ...plan, label: plan.priceId, currency: "eur", amount: 1000, interval: "month", intervalCount: plan.period }));

function renderForm(current, selected, reduceMotion = false, quoteState = { priceId: selected?.priceId, quote: { priceId: selected?.priceId, amountDue: 725, currency: "eur" } }, overrides = {}) {
  let index = 0;
  const hooks = {
    useId: () => "test", useEffect: () => {}, useCallback: callback => callback, useRef: value => ({ current: value }),
    useState: initial => {
      const slot = index++;
      return [slot === 0 ? plans : slot === 3 ? selected?.type || current?.type || "" : slot === 4 ? selected?.priceId || "" : slot === 5 ? "eindhoven" : slot === 9 ? quoteState : initial, () => {}];
    },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    if (name === "react") return hooks;
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name === "framer-motion") return { AnimatePresence: "presence", motion: { div: "motion-div" }, useReducedMotion: () => reduceMotion };
    if (name.endsWith("subscription-checkout.mjs")) return policy;
    if (name.endsWith("IconlyIcons")) return { IconlyDanger: "warning-icon", IconlyQuestion: "question-icon" };
    if (name.endsWith("primereact")) return { SelectInput: "select" };
    if (name.endsWith("http-hook")) return { useHttpClient: () => ({}) };
    if (name.endsWith("helpers")) return { clarityEvent: () => {} };
    if (name.endsWith("events.mjs")) return { ANALYTICS_EVENTS: {}, ANALYTICS_PROPERTIES: {} };
    if (name.endsWith("REGIONS_DESIGN")) return { REGIONS: ["eindhoven"] };
    if (name.endsWith("LoadState")) return { LoadErrorBanner: "load-error-banner" };
    return { __esModule: true, default: name.endsWith(".scss") ? {} : "stub-component" };
  } });
  return exports.SubscriptionCheckoutForm({ currentPriceId: current?.priceId, currentTier: current?.tier,
    initialType: current?.type || "", loadPlans: async () => plans, loadQuote: async () => quoteState?.quote, onCheckout: async () => {}, onPendingChange: () => {}, ...overrides });
}
const elements = node => !node ? [] : Array.isArray(node) ? node.flatMap(elements) : typeof node !== "object" ? [] : [node, ...elements(node.props?.children)];
const label = node => Array.isArray(node) ? node.map(label).join("") : typeof node === "string" ? node : label(node?.props?.children ?? "");

test("every plan pair uses the correct warning and action label", () => {
  for (const current of plans) for (const selected of plans.filter(plan => plan !== current)) {
    const nodes = elements(renderForm(current, selected));
    const warning = nodes.find(node => node.type === "motion-div");
    const submit = nodes.find(node => node.type === "button" && node.props.type === "submit");
    const immediate = current.type !== selected.type || (current.type === "alumni" && selected.tier > current.tier);
    assert.equal(!!warning, immediate, `${current.priceId} → ${selected.priceId}`);
    assert.equal(label(submit), immediate ? "Continue to payment" : current.type === "alumni" ? "Schedule downgrade" : "Confirm switch");
    if (warning) {
      assert.ok(nodes.indexOf(warning) < nodes.indexOf(submit));
      assert.match(label(warning), /We will charge €7\.25 to your payment method/);
      assert.match(label(warning), /when you confirm/);
      assert.doesNotMatch(label(warning), /Stripe/);
      assert.equal(warning.props.animate.opacity, 1);
      assert.equal(warning.props.exit.opacity, 0);
      assert.ok(nodes.some(node => node.type === "presence"));
    }
  }
});

test("loading, failed and stale quotes disable payment without showing another plan's amount", () => {
  for (const state of [null, { priceId: plans[2].priceId, error: true }, { quote: { priceId: "price_old", amountDue: 100, currency: "eur" } }]) {
    const tree = renderForm(plans[0], plans[2], false, state);
    assert.equal(elements(tree).find(node => node.type === "button" && node.props.type === "submit").props.disabled, true);
    assert.doesNotMatch(label(tree), /We will charge €1\.00/);
  }
  const failure = renderForm(plans[0], plans[2], false, { priceId: plans[2].priceId, error: true });
  const retry = elements(failure).find(node => node.type === "load-error-banner");
  assert.equal(retry.props.retryLabel, "Retry amount");
  assert.equal(typeof retry.props.onRetry, "function");
});

test("credits covering the full amount show zero due rather than promising a debit", () => {
  const tree = renderForm(plans[0], plans[2], false, { quote: { priceId: plans[2].priceId, amountDue: 0, currency: "eur" } });
  assert.match(label(tree), /€0\.00 due now/);
  assert.doesNotMatch(label(tree), /We will charge/);
});

test("downgrade copy retains benefits, while Member period copy promises immediate profile updates", () => {
  assert.match(label(renderForm(plans[5], plans[2])), /keep your current tier and benefits until your next billing date/);
  assert.match(label(renderForm(plans[0], plans[1])), /profile will update immediately/);
});

test("no selection hides the warning; new subscriptions warn and reduced motion removes movement", () => {
  assert.equal(policy.validChargeQuote(undefined, undefined), false);
  assert.equal(policy.validChargeQuote(null, plans[0].priceId), false);
  assert.equal(elements(renderForm(null, null, false, null)).some(node => node.type === "motion-div"), false);
  assert.equal(elements(renderForm(plans[0], null)).some(node => node.type === "motion-div"), false);
  const warning = elements(renderForm(null, plans[0], true)).find(node => node.type === "motion-div");
  assert.ok(warning);
  assert.equal(warning.props.initial.y, 0);
  assert.equal(warning.props.exit.y, 0);
  assert.equal(warning.props.transition.duration, 0);
});


test("renewal confirms the exact old Member or Alumni plan before checkout", async () => {
  for (const plan of [plans[0], plans[3]]) {
    const calls = [];
    const tree = renderForm(null, plan, false, undefined, { renewalPriceId: plan.priceId,
      onCheckout: async (...args) => calls.push(args) });
    assert.match(label(tree), /Confirm your plan to start a new subscription/);
    assert.match(label(tree), new RegExp(plan.priceId));
    assert.equal(elements(tree).some(node => node.type === "select" && /-(type|plan)$/.test(node.props.id)), false);
    const submit = elements(tree).find(node => node.type === "button" && node.props.type === "submit");
    assert.equal(label(submit), "Confirm renewal");
    assert.equal(submit.props.disabled, false);
    assert.equal(calls.length, 0);
    await tree.props.onSubmit({ preventDefault() {} });
    await tree.props.onSubmit({ preventDefault() {} });
    assert.deepEqual(calls, [[plan.priceId, plan.type === "member" ? "eindhoven" : undefined]]);
  }
});

test("renewal cannot substitute another plan or continue with an unverified charge", () => {
  for (const renewalPriceId of ["", "price_retired"]) {
    const tree = renderForm(null, plans[0], false, undefined, { renewalPriceId });
    assert.match(label(tree), /previous subscription plan is no longer available/);
    assert.equal(elements(tree).some(node => node.type === "button" && node.props.type === "submit"), false);
  }
  const tree = renderForm(null, plans[0], false, null, { renewalPriceId: plans[0].priceId });
  assert.equal(elements(tree).find(node => node.type === "button" && node.props.type === "submit").props.disabled, true);
});
