import assert from "node:assert/strict";
import test from "node:test";
import { trackSessionActivity, ACTIVITY_INTERVAL_MS } from "../src/util/auth/session-activity.mjs";

function target() {
  const listeners = new Map();
  return { visibilityState: "visible", addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name), emit: (name, extra = {}) => listeners.get(name)?.({ isTrusted: true, ...extra }), listeners };
}
function harness({ expiresIn = 100000, reply } = {}) {
  let clock = 1800000000000, id = 0, ended = 0;
  const timers = new Map(), calls = [], changes = [], win = target(), doc = target();
  const session = { sid: "fixture", auth_time: clock / 1000 - 30 * 86400, exp: (clock + expiresIn) / 1000 };
  const tracker = trackSessionActivity({ session, windowTarget: win, documentTarget: doc,
    onSession: (value) => changes.push(value), onEnd: () => ended++, now: () => clock,
    schedule: (fn, ms) => { timers.set(++id, { fn, at: clock + ms }); return id; }, cancel: (key) => timers.delete(key),
    request: async (url) => { calls.push(url); return reply ? reply(url, session, clock) : Response.json({ session }); },
  });
  return { tracker, session, win, doc, calls, changes, ended: () => ended,
    async advance(ms) {
      clock += ms;
      for (const [key, timer] of [...timers]) if (timer.at <= clock) { timers.delete(key); timer.fn(); }
      await new Promise((resolve) => setImmediate(resolve));
    } };
}
test("mount, focus, background activity and synthetic input never send an activity heartbeat", async () => {
  const h = harness();
  h.win.emit("focus"); h.win.emit("pageshow"); h.win.emit("pointerdown", { isTrusted: false });
  h.doc.visibilityState = "hidden"; h.win.emit("keydown");
  await h.advance(ACTIVITY_INTERVAL_MS); assert.deepEqual(h.calls, []); h.tracker.stop();
});
test("real input is throttled with a final trailing heartbeat and no perpetual keepalive", async () => {
  const h = harness({ expiresIn: 10 * 3600000 });
  h.win.emit("pointerdown"); await h.advance(0); assert.deepEqual(h.calls, ["/api/session/activity"]);
  for (let i = 0; i < 50; i++) h.win.emit("pointermove");
  await h.advance(ACTIVITY_INTERVAL_MS - 1); assert.equal(h.calls.length, 1);
  await h.advance(1); assert.equal(h.calls.length, 2);
  await h.advance(5 * ACTIVITY_INTERVAL_MS); assert.equal(h.calls.length, 2); h.tracker.stop();
});
test("leaving the tab flushes pending real input; returning does not invent new activity", async () => {
  const h = harness({ expiresIn: 10 * 3600000 });
  h.win.emit("keydown"); await h.advance(0);
  h.win.emit("keydown"); h.doc.visibilityState = "hidden"; h.doc.emit("visibilitychange"); await h.advance(0);
  assert.equal(h.calls.length, 2);
  await h.advance(3600000); h.doc.visibilityState = "visible"; h.win.emit("focus"); await h.advance(0);
  assert.equal(h.calls.length, 2); h.tracker.stop();
});
test("a stale tab checks the shared server deadline instead of logging out an active other tab", async () => {
  const h = harness({ expiresIn: 1000, reply: (_url, session, clock) => Response.json({ session: { ...session, exp: clock / 1000 + 3600 } }) });
  await h.advance(1000); assert.deepEqual(h.calls, ["/api/session/current"]);
  assert.equal(h.ended(), 0); assert.equal(h.changes.length, 1); h.tracker.stop();
});
test("confirmed expiry logs out once; an outage leaves UI state intact and retries verification", async () => {
  const expired = harness({ expiresIn: 1000, reply: () => Response.json({}, { status: 401 }) });
  await expired.advance(1000); await expired.advance(30000); assert.equal(expired.ended(), 1);
  assert.equal(expired.win.listeners.size, 0);
  const offline = harness({ expiresIn: 1000, reply: () => { throw new Error("offline"); } });
  await offline.advance(1000); assert.equal(offline.ended(), 0);
  await offline.advance(15000); assert.equal(offline.calls.length, 2); assert.equal(offline.ended(), 0); offline.tracker.stop();
});
test("cleanup prevents delayed requests and notifications", async () => {
  const h = harness({ expiresIn: 1000 }); h.win.emit("keydown"); h.tracker.stop();
  await h.advance(60000); assert.equal(h.calls.length, 0); assert.equal(h.win.listeners.size, 0);
});
