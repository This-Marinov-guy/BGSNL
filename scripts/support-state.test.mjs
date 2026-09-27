import test from "node:test";
import assert from "node:assert/strict";
import { createGuestAccess, guestReports, rememberGuestReport, forgetGuestReport, forgetGuestReports, supportScope, mergeConversation, supportReplyRestriction, supportStatusChange } from "../src/elements/support/support-state.mjs";

test("status history badges use each message's new status, never ordinary reply text", () => {
  for (const status of ["open", "resolved", "rejected", "paused"]) {
    assert.equal(supportStatusChange({ kind: "status", text: `Status changed to ${status}.` }), status);
  }
  assert.equal(supportStatusChange({ kind: "reply", text: "Status changed to rejected." }), null);
  assert.equal(supportStatusChange({ kind: "status", text: "Unexpected update" }), null);
  assert.equal(supportStatusChange(null), null);
});

function memoryStorage() {
  const values = new Map();
  return { values, getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test("client composers are locked for rejected/paused/frozen tickets and enabled again when reopened", () => {
  for (const status of ["rejected", "paused", "frozen"]) {
    assert.ok(supportReplyRestriction({ status, messageCount: 2 }));
  }
  for (const status of ["open", "resolved"]) assert.equal(supportReplyRestriction({ status, messageCount: 2 }), "");
  assert.equal(supportReplyRestriction({ status: "paused", messageCount: 2 }, true), "");
  assert.ok(supportReplyRestriction({ status: "open", messageCount: 200 }, true));
  const current = { id: "ticket", revision: 1, status: "open", messages: [] };
  const paused = mergeConversation(current, { ...current, revision: 2, status: "paused" });
  assert.ok(supportReplyRestriction(paused));
  assert.equal(supportReplyRestriction(mergeConversation(paused, { ...current, revision: 3 })), "");
});

test("guest access uses random credentials, survives reload and expires", () => {
  const storage = memoryStorage(); const access = createGuestAccess();
  rememberGuestReport(access, storage);
  assert.deepEqual(guestReports(storage), [access]);
  assert.deepEqual(Object.keys(access).sort(), ["expiresAt", "id", "secret"]);
  assert.match(access.secret, /^[a-f0-9]{64}$/);
  assert.notEqual(access.secret, createGuestAccess().secret);
  assert.deepEqual(guestReports(storage, access.expiresAt + 1), []);
  forgetGuestReport(access.id, storage); assert.deepEqual(guestReports(storage), []);
});

test("broken storage fails safely, and at most 20 valid guest references are retained", () => {
  assert.deepEqual(guestReports({ getItem: () => "invalid json" }), []);
  assert.deepEqual(guestReports({ getItem: () => { throw new Error("Blocked"); } }), []);
  assert.throws(() => rememberGuestReport(createGuestAccess(), { getItem: () => null, setItem: () => { throw new Error("Blocked"); } }), /Allow this website/);
  const storage = memoryStorage();
  for (let i = 0; i < 20; i++) rememberGuestReport(createGuestAccess(), storage);
  assert.equal(guestReports(storage).length, 20);
  assert.throws(() => rememberGuestReport(createGuestAccess(), storage), /20 saved/);
  forgetGuestReports(storage); assert.equal(storage.values.size, 0);
});

test("account switches clear the UI boundary while token refresh preserves it", () => {
  const token = (userId, iat) => ({ userId, iat });
  assert.equal(supportScope(null), "guest");
  assert.equal(supportScope({}), "guest");
  assert.equal(supportScope(token("a", 1)), supportScope(token("a", 2)));
  assert.notEqual(supportScope(token("a", 1)), supportScope(token("b", 1)));
});

test("polling preserves paged history, deduplicates messages and never regresses status", () => {
  const previous = { id: "report", revision: 3, status: "resolved", messages: [{ id: "a", order: 0 }, { id: "b", order: 1 }] };
  const incoming = { id: "report", revision: 2, status: "open", messages: [{ id: "b", order: 1 }] };
  assert.deepEqual(mergeConversation(previous, incoming), previous);
  const newer = { ...incoming, revision: 4, messages: [{ id: "c", order: 2 }] };
  assert.equal(mergeConversation(previous, newer).status, "open");
  assert.deepEqual(mergeConversation(previous, newer).messages.map(({ id }) => id), ["a", "b", "c"]);
  assert.deepEqual(mergeConversation(previous, { ...incoming, id: "other" }), { ...incoming, id: "other" });
});

test("loading older pages preserves the oldest cursor across live snapshots", () => {
  const latest = { id: "ticket", revision: 80, before: 60, messages: [{ id: "m60", order: 60 }, { id: "m79", order: 79 }] };
  const older = { ...latest, before: 40, messages: [{ id: "m40", order: 40 }, { id: "m59", order: 59 }] };
  const merged = mergeConversation(latest, older);
  assert.equal(merged.before, 40);
  assert.equal(mergeConversation(merged, latest).before, 40);
  const complete = mergeConversation(merged, { ...older, before: null, messages: [{ id: "m0", order: 0 }] });
  assert.equal(mergeConversation(complete, latest).before, null);
});
