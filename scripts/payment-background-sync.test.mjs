import test from "node:test";
import assert from "node:assert/strict";
import { startPaymentSync } from "../src/util/payments/background-sync.mjs";

test("background sync continues, backs off, respects visibility/in-flight work and cleans up", () => {
  let now = 0, visible = true, busy = false, checks = 0, slow = 0, handler, unlistened = false;
  let nextId = 0;
  const jobs = new Map();
  const stop = startPaymentSync({ now: () => now, visible: () => visible, busy: () => busy,
    check: () => checks++, onSlow: () => slow++,
    schedule: (callback, delay) => { const id = ++nextId; jobs.set(id, { callback, delay }); return id; },
    cancel: (id) => jobs.delete(id), listen: (callback) => { handler = callback; return () => { unlistened = true; }; },
  });
  const step = () => { const job = [...jobs.values()][0]; now += job.delay; job.callback(); };
  step(); assert.equal(checks, 1);
  busy = true; step(); assert.equal(checks, 1);
  busy = false; visible = false; step(); assert.equal(checks, 1);
  visible = true; handler(); assert.equal(checks, 2); assert.equal(jobs.size, 1);
  now = 120000; step(); assert.equal(slow, 1);
  assert.equal([...jobs.values()][0].delay, 15000);
  const previous = checks; step(); assert.equal(checks, previous + 1); assert.equal(slow, 1);
  stop(); assert.equal(jobs.size, 0); assert.equal(unlistened, true);
  handler(); assert.equal(jobs.size, 0);
});
