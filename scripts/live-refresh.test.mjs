import test from "node:test";
import assert from "node:assert/strict";
import { createLiveRefresh } from "../src/util/functions/live-refresh.mjs";
import { mergeGuestList } from "../src/util/functions/merge-guest-list.mjs";

test("live notifications suspend polling; fallback resumes without replacing unchanged rows", async () => {
  const timer = clock(); let connected = true, calls = 0;
  const loop = createLiveRefresh({ ...timer, interval: () => connected ? null : 10000,
    load: async () => ++calls, onData() {}, onError: assert.fail });
  await loop.start(); assert.equal(timer.delay, undefined);
  connected = false; loop.invalidate(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2); assert.equal(timer.delay, 10000); loop.stop();
  const current = [{ id: "a", status: 0 }, { id: "b", status: 0 }];
  assert.equal(mergeGuestList(current, structuredClone(current)), current);
  const next = mergeGuestList(current, [{ id: "a", status: 1 }, { id: "b", status: 0 }]);
  assert.notEqual(next[0], current[0]); assert.equal(next[1], current[1]);
});

function clock() {
  let task;
  return { schedule(fn, delay) { task = { fn, delay }; return task; }, cancel() { task = null; },
    get delay() { return task?.delay; }, async tick() { const next = task; task = null; await next?.fn(); } };
}
test("polling refreshes every two seconds and pauses when hidden", async () => {
  const timer = clock(); let active = true, calls = 0;
  const snapshots = [];
  const loop = createLiveRefresh({ ...timer, load: async () => ++calls, onData: value => snapshots.push(value), onError: assert.fail, isActive: () => active });
  await loop.start();
  assert.equal(timer.delay, 2000);
  active = false; await timer.tick(); assert.equal(calls, 1);
  active = true; await timer.tick(); assert.deepEqual(snapshots, [1, 2]);
  loop.stop(); assert.equal(timer.delay, undefined);
});
test("invalidation rejects stale snapshots and requests one fresh copy", async () => {
  const timer = clock(); let resolve, calls = 0;
  const snapshots = [];
  const loop = createLiveRefresh({ ...timer, load: () => { calls++; return new Promise(done => { resolve = done; }); }, onData: value => snapshots.push(value), onError: assert.fail });
  const request = loop.start();
  loop.invalidate(); loop.invalidate(); assert.equal(calls, 1);
  resolve("stale"); await request;
  assert.deepEqual(snapshots, []); assert.equal(timer.delay, 0);
  const fresh = timer.tick(); resolve("fresh"); await fresh;
  assert.deepEqual(snapshots, ["fresh"]);
  loop.stop();
});
test("failure backs off; teardown ignores late results", async () => {
  const timer = clock(); let failures = 0;
  const loop = createLiveRefresh({ ...timer, load: async () => { throw new Error("offline"); }, onData: assert.fail, onError: () => failures++ });
  await loop.start(); assert.equal(failures, 1); assert.equal(timer.delay, 10000);
  loop.stop();
  let resolve;
  const later = createLiveRefresh({ ...timer, load: () => new Promise(done => { resolve = done; }), onData: assert.fail, onError: assert.fail });
  const request = later.start(); later.stop(); resolve({}); await request;
  assert.equal(timer.delay, undefined);
});
