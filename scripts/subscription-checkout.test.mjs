import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  canManageSubscription, canStartSubscription, hasBillingReference, hasSubscriptionId, paidSubscriptionPlans, requestSubscriptionCheckout, subscriptionPlanLabel,
} from "../src/elements/subscriptions/subscription-checkout.mjs";

test("billing management requires a subscription or customer identifier", () => {
  for (const subscription of [undefined, null, {}, { id: "" }, { id: "  " }, { id: "active" }, { customerId: null }, { customerId: "undefined" }])
    assert.equal(hasBillingReference(subscription), false);
  assert.equal(hasBillingReference({ id: "sub_active" }), true);
  assert.equal(hasBillingReference({ customerId: "cus_existing" }), true);
});

test("cancellation requires a subscription ID, not just a customer or entitlement flag", () => {
  for (const subscription of [undefined, null, {}, { customerId: "cus_existing" }, { id: "" }, { id: "  " }, { id: "undefined" }])
    assert.equal(hasSubscriptionId(subscription), false);
  assert.equal(hasSubscriptionId({ id: "sub_existing" }), true);
  assert.equal(hasSubscriptionId({ id: "sub_existing", isSubscribed: false }), true);
});

test("cancel opens the shared confirmation modal and only confirmation requests the Stripe cancellation flow", async () => {
  const component = await readFile(new URL("../src/elements/ui/buttons/SubscriptionManage.jsx", import.meta.url), "utf8");
  const actions = await readFile(new URL("../src/elements/subscriptions/BillingActions.jsx", import.meta.url), "utf8");
  assert.match(component, /canCancel && hasSubscriptionId\(subscription\)/);
  assert.match(component, /onClick=\{\(\) => \{ setError\(""\); setConfirmCancel\(true\); \}\}/);
  assert.match(component, /action === "cancel" && \(!showCancel \|\| !confirmCancel\)/);
  assert.match(component, /<AppModal open=\{confirmCancel && showCancel\}/);
  assert.match(component, /Keep subscription/);
  assert.match(component, /onClick=\{\(\) => openPortal\("cancel"\)\}/);
  assert.match(component, /inFlight\.current/);
  assert.match(actions, /<SubscriptionManage subscription=\{user\.subscription\} \/>/);
  assert.doesNotMatch(actions, /primaryOnly|isSubscribed/);
});

test("missing, empty and customer-only subscriptions offer checkout", () => {
  for (const status of ["active", "locked", "payment_awaiting"]) {
    for (const subscription of [undefined, null, {}, { customerId: "cus_existing" }]) {
      assert.equal(canStartSubscription({ status, subscription }), true);
    }
  }
});

test("only ended subscriptions can start again; restricted accounts cannot buy access", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "paused", "incomplete", undefined]) {
    assert.equal(canStartSubscription({ status: "active", subscription: { id: "sub_current", status } }), false);
  }
  for (const status of ["canceled", "incomplete_expired"]) {
    assert.equal(canStartSubscription({ status: "active", subscription: { id: "sub_old", status } }), true);
  }
  for (const user of [null, undefined, {}, { status: "frozen" }, { status: "suspended" }]) {
    assert.equal(canStartSubscription(user), false);
  }
});

test("Start subscription takes precedence over Manage billing, including old Stripe references", () => {
  for (const status of ["active", "locked", "payment_awaiting"]) {
    for (const subscription of [undefined, {}, { customerId: "cus_existing" },
      { id: "sub_old", status: "canceled" }, { id: "sub_old", status: "incomplete_expired" }]) {
      const user = { status, subscription };
      assert.equal(canStartSubscription(user), true);
      assert.equal(canManageSubscription(user), false);
    }
  }
});

test("existing subscriptions keep billing access, while accounts without either action use support", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"]) {
    const user = { status: "locked", subscription: { id: "sub_existing", status } };
    assert.equal(canStartSubscription(user), false);
    assert.equal(canManageSubscription(user), true);
  }
  for (const status of ["frozen", "suspended"]) {
    assert.equal(canManageSubscription({ status, subscription: { customerId: "cus_existing" } }), true);
    assert.equal(canManageSubscription({ status }), false);
  }
  for (const user of [undefined, null, {}]) assert.equal(canManageSubscription(user), false);
});

const member = { priceId: "price_member6", type: "member", amount: 1500, currency: "eur", interval: "month", intervalCount: 6, label: "Member · 6 months" };
const alumni = { ...member, priceId: "price_alumni1", type: "alumni", intervalCount: 1, label: "Alumni · Tier 1" };

test("the chooser displays only valid recurring paid Member and Alumni plans", () => {
  assert.deepEqual(paidSubscriptionPlans([member, alumni, { priceId: "alumni_free", amount: 0, type: "alumni", tier: 0 }, null,
    ...[{ amount: 0 }, { currency: "usd" }, { interval: undefined }, { intervalCount: 0 }, { priceId: "invented" }, { type: "unknown" }]
      .map((override) => ({ ...member, ...override })),
  ]), [member, alumni]);
  assert.deepEqual(paidSubscriptionPlans([]), []);
  for (const value of [undefined, null, {}]) assert.throws(() => paidSubscriptionPlans(value));
  assert.match(subscriptionPlanLabel(member), /€15\.00 \/ 6 months$/);
  assert.match(subscriptionPlanLabel(alumni), /€15\.00 \/ month$/);
});

test("checkout sends only the selected price and return origin, never account details or client prices", async () => {
  const calls = [];
  const url = await requestSubscriptionCheckout(async (...args) => {
    calls.push(args);
    return { url: "https://checkout.stripe.com/c/pay/cs_test" };
  }, member.priceId, "http://localhost:3000");
  assert.equal(url, "https://checkout.stripe.com/c/pay/cs_test");
  assert.deepEqual(calls, [["payment/subscription/change", "POST", {
    itemId: "price_member6", origin_url: "http://localhost:3000",
  }, {}, true, false]]);
});

test("server reconciliation can safely redirect an existing subscription to its Stripe portal", async () => {
  assert.equal(await requestSubscriptionCheckout(async () => ({ url: "https://billing.stripe.com/p/session/test" }), alumni.priceId, "https://bulgariansociety.nl"),
    "https://billing.stripe.com/p/session/test");
});

test("failed requests and invalid redirect URLs remain recoverable in the modal", async () => {
  for (const url of [undefined, "", "javascript:alert(1)", "http://checkout.stripe.com/test", "https://checkout.stripe.com.evil.test/", "https://evil.test/", "https://user@checkout.stripe.com/", "https://checkout.stripe.com:8080/"]) {
    await assert.rejects(requestSubscriptionCheckout(async () => ({ url }), member.priceId, "http://localhost:3000"), /could not open the payment page/);
  }
  await assert.rejects(requestSubscriptionCheckout(async () => undefined, member.priceId, "http://localhost:3000"), /could not open the payment page/);
  await assert.rejects(requestSubscriptionCheckout(async () => { throw new Error("Offline"); }, member.priceId, "http://localhost:3000"), /Offline/);
});
