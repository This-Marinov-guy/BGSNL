import test from "node:test";
import assert from "node:assert/strict";
import { optionalPromotionDateSchema } from "../src/util/functions/event-promotion-dates.mjs";

test("promotion date fields accept missing, empty, cleared and scheduled values", async () => {
  for (const value of [undefined, null, "", "2026-09-24T12:00:00Z", new Date("2026-09-24T12:00:00Z")]) {
    assert.equal(await optionalPromotionDateSchema.isValid(value), true, String(value));
  }
});

test("promotion date fields still reject malformed dates", async () => {
  for (const value of ["not-a-date", " ", "2026-99-99"]) {
    assert.equal(await optionalPromotionDateSchema.isValid(value), false, value);
  }
});
