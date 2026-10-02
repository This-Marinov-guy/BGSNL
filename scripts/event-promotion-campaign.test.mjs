import test from "node:test";
import assert from "node:assert/strict";
import { hasEventPromotionImprovement } from "../src/util/functions/event-promotion-campaign.mjs";
import { browserApiPath } from "../src/util/auth/proxy-policy.mjs";
const original = { status: "opened", product: { guest: { price: 15 }, member: { price: 10 }, promoCodes: [] } };
test("promotion prompt covers lower prices, new discounts, early bird and codes", () => {
  for (const values of [{ guestPrice: 12 }, { isFree: true }, { isMemberFree: true },
    { guestPromotion: { isEnabled: true, discount: 10 } }, { earlyBird: { isEnabled: true, price: 8 } },
    { promoCodes: { isEnabled: true, codes: [{ code: "HELLO", active: true }] } }]) assert.equal(hasEventPromotionImprovement(original, values), true);
});
test("ordinary edits, price increases, disabled offers, drafts and external events do not prompt", () => {
  for (const values of [{ title: "new" }, { guestPrice: 15 }, { guestPrice: 20 }, { earlyBird: { isEnabled: false } }, { isTicketLink: true, guestPrice: 10 }]) assert.equal(hasEventPromotionImprovement(original, values), false);
  assert.equal(hasEventPromotionImprovement({ ...original, status: "draft" }, { guestPrice: 5 }), false);
});
test("campaign proxy exposes only preview, confirm and status with safe path IDs", () => {
  assert.ok(browserApiPath(["event", "event-id", "campaigns", "preview"], "POST"));
  assert.ok(browserApiPath(["event", "event-id", "campaigns", "confirm"], "POST"));
  assert.ok(browserApiPath(["event", "event-id", "campaigns", "campaign-id"], "GET"));
  assert.equal(browserApiPath(["event", "event-id", "campaigns", "send-all"], "POST"), null);
});
