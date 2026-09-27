import test from "node:test";
import assert from "node:assert/strict";
import { visibleFutureEvents } from "../src/util/functions/visible-future-events.mjs";
import { shouldArchiveEvent } from "../src/util/functions/event-archive.mjs";

const now = Date.parse("2026-09-28T12:00:00Z");
const grace = 48 * 60 * 60 * 1000;
const event = (id, age, overrides = {}) => ({
  id, status: "opened", date: new Date(now - age).toISOString(), ...overrides,
});

test("future listings hide active events at exactly 48 hours, independently of archiving", () => {
  const source = { amsterdam: [
    event("upcoming", -1), event("today", 0), event("recent", grace - 1),
    event("two-days", grace), event("older", grace + 1),
  ] };
  const before = structuredClone(source);
  for (const signedIn of [false, true]) {
    assert.deepEqual(visibleFutureEvents(source, ["amsterdam"], signedIn, now).map(item => item.id),
      ["upcoming", "today", "recent"]);
  }
  assert.equal(shouldArchiveEvent(source.amsterdam[3], now), false);
  assert.deepEqual(source, before);
});

test("corrected dates control visibility in both directions", () => {
  const source = { amsterdam: [
    event("rescheduled-future", grace * 2, { correctedDate: new Date(now + 1).toISOString() }),
    event("rescheduled-past", -grace, { correctedDate: new Date(now - grace).toISOString() }),
    event("original-date", grace, { correctedDate: null }),
  ] };
  assert.deepEqual(visibleFutureEvents(source, ["amsterdam"], false, now).map(item => item.id),
    ["rescheduled-future"]);
});

test("age filtering preserves regional, hidden, and member-only restrictions", () => {
  const source = {
    amsterdam: [event("public", 0), event("members", 0, { memberOnly: true }),
      event("hidden", 0, { hidden: true }), event("old-members", grace, { memberOnly: true })],
    groningen: [event("other", 0), event("other-old", grace)],
  };
  const ids = (regions, auth) => visibleFutureEvents(source, regions, auth, now).map(item => item.id);
  assert.deepEqual(ids(["amsterdam"], false), ["public"]);
  assert.deepEqual(ids(["amsterdam"], true), ["public", "members"]);
  assert.deepEqual(ids(["amsterdam", "groningen"], false), ["public", "other"]);
  assert.deepEqual(ids(["rotterdam"], true), []);
});
