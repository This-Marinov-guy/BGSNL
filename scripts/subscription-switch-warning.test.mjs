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

function renderForm(current, selected, reduceMotion = false, quoteState = { priceId: selected?.priceId, quote: { priceId: selected?.priceId, amountDue: 725, currency: "eur" } }) {
  let index = 0;
  const hooks = {
    useId: () => "test", useEffect: () => {}, useCallback: callback => callback, useRef: value => ({ current: value }),
    useState: initial => {
      const slot = index++;
      return [slot === 0 ? plans : slot === 3 ? selected?.type || current?.type || "" : slot === 4 ? selected?.priceId || "" : slot === 8 ? quoteState : initial, () => {}];
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
    return { __esModule: true, default: name.endsWith(".scss") ? {} : "stub-component" };
  } });
  return exports.SubscriptionCheckoutForm({ currentPriceId: current?.priceId, currentTier: current?.tier,
    initialType: current?.type || "", loadPlans: async () => plans, loadQuote: async () => quoteState?.quote, onCheckout: async () => {}, onPendingChange: () => {} });
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
      assert.match(label(warning), /€7\.25 will be taken from your payment method/);
      assert.match(label(warning), /when you confirm in Stripe/);
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
    assert.doesNotMatch(label(tree), /€1\.00 will be taken/);
  }
  const failure = renderForm(plans[0], plans[2], false, { priceId: plans[2].priceId, error: true });
  assert.match(label(failure), /Retry amount/);
});

test("credits covering the full amount show zero due rather than promising a debit", () => {
  const tree = renderForm(plans[0], plans[2], false, { quote: { priceId: plans[2].priceId, amountDue: 0, currency: "eur" } });
  assert.match(label(tree), /€0\.00 due now/);
  assert.doesNotMatch(label(tree), /will be taken/);
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
