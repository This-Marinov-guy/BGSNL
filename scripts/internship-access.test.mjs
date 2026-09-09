import assert from "node:assert/strict";
import test from "node:test";
import { getInternshipApplyAccess } from "../src/elements/ui/modals/internship-access.mjs";

test("guests retain the join/login flow", () => {
  for (const user of [null, undefined]) assert.deepEqual(getInternshipApplyAccess(user), { mode: "guest" });
});

test("only active accounts with verified benefits can open an application", () => {
  assert.deepEqual(getInternshipApplyAccess({ status: "active", hasBenefits: true }), { mode: "apply" });
  for (const hasBenefits of [false, undefined, null, "true"]) {
    const access = getInternshipApplyAccess({ status: "active", hasBenefits });
    assert.equal(access.mode, "account");
    assert.equal(access.notice.href, "/user#settings");
  }
});

test("locked and payment-awaiting accounts get Settings, never a join/login prompt", () => {
  for (const status of ["locked", "payment_awaiting"]) {
    for (const hasBenefits of [false, true]) {
      const access = getInternshipApplyAccess({ status, hasBenefits });
      assert.equal(access.mode, "account");
      assert.equal(access.notice.title, "Your membership is locked");
      assert.equal(access.notice.href, "/user#settings");
      assert.equal(access.notice.actionLabel, "Go to settings");
    }
  }
});

test("frozen and suspended accounts get the correct restriction notice and Support", () => {
  for (const status of ["frozen", "suspended"]) {
    const access = getInternshipApplyAccess({ status, hasBenefits: true, billingLocked: true, billingVerificationUnavailable: true });
    assert.equal(access.mode, "account");
    assert.equal(access.notice.title, `Your account is ${status}`);
    assert.equal(access.notice.href, "/user#help");
    assert.equal(access.notice.actionLabel, "Contact support");
    assert.match(access.notice.description, status === "frozen" ? /investigating/ : /going to close/);
  }
});

test("billing verification failures and stale benefit flags cannot open an application", () => {
  for (const restriction of [{ billingLocked: true }, { billingVerificationUnavailable: true }]) {
    const access = getInternshipApplyAccess({ status: "active", hasBenefits: true, ...restriction });
    assert.equal(access.mode, "account");
    assert.equal(access.notice.href, "/user#settings");
  }
  for (const status of [undefined, "", "unknown", "membership-migrated"]) {
    assert.equal(getInternshipApplyAccess({ status, hasBenefits: true }).mode, "account");
  }
});
