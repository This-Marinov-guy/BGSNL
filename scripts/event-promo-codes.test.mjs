import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePromoCode, normalizePromoCodeName, promoCodesPayload, promoCodesSchema } from '../src/util/functions/event-promo-codes.mjs';
const code = () => normalizePromoCode({ code: ' welcome20 ', discount: 20 });
test('new codes default to guests and members while preserving configured audiences', () => {
  assert.deepEqual(code().audiences, ['guest', 'member']);
  assert.deepEqual(normalizePromoCode({ audiences: ['member'] }).audiences, ['member']);
});
test('blank optional limits validate and produce null, disabling sends an empty array', async () => {
  await promoCodesSchema.validate({ isEnabled: true, codes: [code()] });
  const [payload] = promoCodesPayload({ isEnabled: true, codes: [code()] });
  assert.equal(payload.code, 'WELCOME20');
  assert.equal(payload.useLimit, null);
  assert.equal(payload.timeLimit, null);
  assert.deepEqual(promoCodesPayload({ isEnabled: false, codes: [code()] }), []);
});
test('promo names immediately remove whitespace and become uppercase', () => {
  assert.equal(normalizePromoCodeName(' welcome 20 '), 'WELCOME20');
  assert.equal(normalizePromoCode({ code: 'summer 2026' }).code, 'SUMMER2026');
});
test('invalid restrictions and duplicate codes block review', async () => {
  for (const patch of [{ audiences: [] }, { discount: 101 }, { useLimit: 0 }, { useLimit: 1.5 }, { timeLimit: 'invalid' }, { code: 'invalid_code' }]) {
    await assert.rejects(promoCodesSchema.validate({ isEnabled: true, codes: [{ ...code(), ...patch }] }));
  }
  await assert.rejects(promoCodesSchema.validate({ isEnabled: true, codes: [code(), code()] }));
  await promoCodesSchema.validate({ isEnabled: false, codes: [{ code: '' }] });
});
