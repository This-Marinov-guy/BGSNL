import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { billingAction } from "../src/elements/subscriptions/subscription-checkout.mjs";
import { needsBillingAttention } from "../src/elements/subscriptions/account-status-notice.mjs";

test("only billing-restricted accounts request diagnostics, not healthy/free or administratively restricted accounts", () => {
  for (const user of [null, { status: "active", hasBenefits: true }, { status: "active", tier: 0 }, { status: "frozen", billingLocked: true }]) assert.equal(needsBillingAttention(user), false);
  for (const user of [{ status: "locked" }, { status: "payment_awaiting" }, { status: "active", billingVerificationUnavailable: true }, { status: "active", billingLocked: true }]) assert.equal(needsBillingAttention(user), true);
});

test("banner and billing use the same action policy", () => {
  assert.equal(billingAction({ status: "locked" }, "no_membership"), "start");
  const existing = { status: "locked", subscription: { id: "sub_current", customerId: "cus_current", status: "past_due" } };
  assert.equal(billingAction(existing, "payment_failed"), "manage");
  assert.equal(billingAction(existing, "unavailable"), "manage");
  assert.equal(billingAction({ status: "locked" }, "unavailable"), "support");
  assert.equal(billingAction(existing, "account_sync_pending"), "support");
  assert.equal(billingAction({ ...existing, status: "frozen" }, "payment_failed"), "support");
  assert.equal(billingAction({ ...existing, subscription: { ...existing.subscription, status: "canceled" } }, "subscription_ended"), "start");
});

test("both surfaces share the provider/actions and banner supports skeleton, enter and exit states", async () => {
  const load = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
  const [settings, account, alert, provider] = await Promise.all([
    load("elements/ui/tabs/SettingsTab.jsx"), load("screens/authentication/User.jsx"),
    load("elements/subscriptions/AccountBillingAlert.jsx"), load("elements/subscriptions/BillingAttentionProvider.jsx"),
  ]);
  assert.match(settings, /<AccountBillingAlert user=\{user\} showAction=\{false\}/);
  assert.match(settings, /<BillingActions user=\{user\}/);
  assert.match(account, /<BillingAttentionProvider user=\{currentUser\}/);
  assert.match(alert, /<BillingActions user=\{user\} \/>/);
  assert.match(alert, /loading \? <BillingStatusBannerSkeleton/);
  assert.match(alert, /<AnimatePresence mode="wait"/);
  assert.match(alert, /exit=\{/);
  assert.match(provider, /operation\.current\?\.key !== key/);
  assert.match(provider, /if \(active\) setResult/);
  assert.match(provider, /"GET", null, \{\}, false, false/);
});
