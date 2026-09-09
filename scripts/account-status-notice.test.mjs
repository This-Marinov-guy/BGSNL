import test from "node:test";
import assert from "node:assert/strict";
import { getAccountStatusNotice } from "../src/elements/subscriptions/account-status-notice.mjs";

test("healthy accounts and missing account data do not show a warning", () => {
  for (const user of [undefined, null, { status: "active" }, { status: "active", tier: 0, hasBenefits: false }]) {
    assert.equal(getAccountStatusNotice(user), null);
  }
});

test("billing locks use the requested copy and always link to Settings, even without a Stripe customer", () => {
  for (const user of [{ status: "locked" }, { status: "payment_awaiting" }, { status: "active", billingLocked: true }]) {
    const notice = getAccountStatusNotice(user);
    assert.equal(notice.title, "Your membership is locked");
    assert.equal(notice.description, "Your subscription needs attention. Go to settings, change your payment method, subscription type or cancel your membership.");
    assert.equal(notice.href, "/user#settings");
    assert.equal(notice.actionLabel, "Go to settings");
  }
});

test("frozen accounts are under investigation, not scheduled for closure", () => {
  const notice = getAccountStatusNotice({ status: "frozen" });
  assert.equal(notice.title, "Your account is frozen");
  assert.match(notice.description, /investigating/);
  assert.doesNotMatch(notice.description, /close|suspended/);
  assert.equal(notice.href, "/user#help");
  assert.equal(notice.actionLabel, "Contact support");
});

test("suspended accounts receive the closure notice and support link", () => {
  const notice = getAccountStatusNotice({ status: "suspended" });
  assert.equal(notice.title, "Your account is suspended");
  assert.equal(notice.description, "Your account is suspended and we are going to close it. Please contact support for help.");
  assert.equal(notice.href, "/user#help");
});

test("administrative restrictions cannot be masked by payment failures or billing outages", () => {
  for (const status of ["frozen", "suspended"]) {
    const notice = getAccountStatusNotice({ status, billingLocked: true, billingVerificationUnavailable: true, lockReason: "payment_failed" });
    assert.equal(notice.title, `Your account is ${status}`);
    assert.equal(notice.href, "/user#help");
    assert.equal(notice.paymentNote, undefined);
  }
});

test("verification outages do not falsely claim payment failure", () => {
  const notice = getAccountStatusNotice({ status: "active", billingVerificationUnavailable: true });
  assert.equal(notice.title, "We could not verify your subscription");
  assert.equal(notice.href, "/user#settings");
});

test("payment failure keeps the outstanding-invoice clarification", () => {
  const notice = getAccountStatusNotice({ status: "locked", lockReason: "payment_failed" });
  assert.match(notice.paymentNote, /does not restore paid benefits/);
  assert.match(notice.paymentNote, /outstanding invoice/);
});

test("other non-active account states receive a generic restriction notice", () => {
  const notice = getAccountStatusNotice({ status: "review_required" });
  assert.equal(notice.title, "Your account is restricted");
  assert.match(notice.description, /benefits are unavailable/);
  assert.equal(notice.href, "/user#help");
});
