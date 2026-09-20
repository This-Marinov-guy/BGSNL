import test from 'node:test';
import assert from 'node:assert/strict';
import { DISMISSAL_KEY, DISMISSAL_TTL, dismissRecommendations, isRecommendationDismissed, restoreRecommendations } from '../src/util/functions/event-recommendation-dismissal.mjs';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};
test('dismissal applies only to its event and expires after exactly two weeks', () => {
  const storage = memoryStorage();
  const now = 1_000_000;
  assert.equal(DISMISSAL_TTL, 1_209_600_000);
  dismissRecommendations(storage, 'event-a', now);
  assert.equal(isRecommendationDismissed(storage, 'event-a', now + DISMISSAL_TTL - 1), true);
  assert.equal(isRecommendationDismissed(storage, 'event-b', now), false);
  assert.equal(isRecommendationDismissed(storage, 'event-a', now + DISMISSAL_TTL), false);
  assert.equal(storage.getItem(DISMISSAL_KEY), null);
});
test('expired entries are removed without losing active dismissals', () => {
  const storage = memoryStorage();
  dismissRecommendations(storage, 'old', 100);
  dismissRecommendations(storage, 'current', 200);
  assert.equal(isRecommendationDismissed(storage, 'current', DISMISSAL_TTL + 100), true);
  assert.deepEqual(JSON.parse(storage.getItem(DISMISSAL_KEY)), { current: DISMISSAL_TTL + 200 });
});
test('corrupt or blocked storage does not break the page', () => {
  const storage = memoryStorage();
  for (const value of ['{bad', 'null', '[]', '42', '{"a":"forever"}']) {
    storage.setItem(DISMISSAL_KEY, value);
    assert.equal(isRecommendationDismissed(storage, 'a', 100), false);
  }
  const blocked = { getItem() { throw new Error('blocked'); } };
  assert.equal(isRecommendationDismissed(blocked, 'a'), false);
  assert.doesNotThrow(() => dismissRecommendations(blocked, 'a'));
});

test('manual reopening clears only the chosen event dismissal', () => {
  const storage = memoryStorage();
  dismissRecommendations(storage, 'a', 100);
  dismissRecommendations(storage, 'b', 100);
  restoreRecommendations(storage, 'a', 200);
  assert.equal(isRecommendationDismissed(storage, 'a', 200), false);
  assert.equal(isRecommendationDismissed(storage, 'b', 200), true);
});
