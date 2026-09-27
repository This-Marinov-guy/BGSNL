import test from "node:test";
import assert from "node:assert/strict";
import { markSupportSeen, readSupportSeen, supportTicketUnread, SUPPORT_SEEN_CHANGED } from "./support-unread.mjs";

test("unread dots distinguish incoming replies from own messages and new staff tickets", () => {
  assert.equal(supportTicketUnread({ id: "a", revision: 0, lastAuthor: "requester" }, {}), false);
  assert.equal(supportTicketUnread({ id: "a", revision: 0, lastAuthor: "requester" }, {}, true), true);
  assert.equal(supportTicketUnread({ id: "a", revision: 2, lastAuthor: "staff" }, { a: 1 }), true);
  assert.equal(supportTicketUnread({ id: "a", revision: 2, lastAuthor: "staff" }, { a: 2 }), false);
  assert.equal(supportTicketUnread({ id: "a", revision: 2, lastAuthor: "staff" }, {}, true), false);
});

test("read state persists per viewer, never regresses, and notifies other mounted views", t => {
  const previous = globalThis.window;
  const values = new Map(); const browser = new EventTarget(); let notifications = 0;
  browser.localStorage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  browser.addEventListener(SUPPORT_SEEN_CHANGED, () => notifications++);
  globalThis.window = browser;
  t.after(() => { globalThis.window = previous; });
  markSupportSeen("account:test:requester", { id: "ticket", revision: 3 });
  markSupportSeen("account:test:requester", { id: "ticket", revision: 2 });
  assert.deepEqual(readSupportSeen("account:test:requester"), { ticket: 3 });
  assert.deepEqual(readSupportSeen("account:other:requester"), {});
  assert.deepEqual(readSupportSeen("account:test:staff"), {});
  assert.equal(notifications, 1);
  Object.defineProperty(browser, "localStorage", { get() { throw new Error("Blocked storage"); } });
  markSupportSeen("guest:requester", { id: "guest-ticket", revision: 1 });
  assert.deepEqual(readSupportSeen("guest:requester"), { "guest-ticket": 1 });
});
