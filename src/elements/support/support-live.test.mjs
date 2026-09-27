import test from "node:test";
import assert from "node:assert/strict";
import { SUPPORT_CHANGED, supportStreamFrames, watchSupportLive } from "./support-live.mjs";
import { clearCsrf } from "../../util/auth/browser-request.mjs";
import { mergeSupportTickets } from "./support-state.mjs";
import { browserApiPath } from "../../util/auth/proxy-policy.mjs";

test("support SSE parser handles chunk boundaries, heartbeats and batched invalidations", () => {
  const events = [];
  const consume = supportStreamFrames(event => events.push(event));
  consume("retry: 3000\nevent: rea");
  consume("dy\ndata: {}\n\n: heartbeat\n\nevent: changed\ndata:");
  consume(" {}\n\nevent: changed\ndata: {}\n\n");
  assert.deepEqual(events, ["ready", "changed", "changed"]);
});

test("support SSE parser bounds malformed buffered data", () => {
  assert.throws(() => supportStreamFrames(() => {})("x".repeat(16385)), /Invalid support stream/);
});

test("ticket list merges preserve untouched rows and reflect additions and statuses", () => {
  const first = { id: "a", status: "open" }; const second = { id: "b", status: "open" };
  const previous = [first, second];
  assert.equal(mergeSupportTickets(previous, [{ ...first }, { ...second }]), previous);
  const merged = mergeSupportTickets(previous, [{ id: "c", status: "open" }, { ...first }, { ...second, status: "resolved" }]);
  assert.equal(merged[1], first); assert.equal(merged[2].status, "resolved");
  assert.equal(browserApiPath(["support", "live"], "POST"), "support/live");
  assert.equal(browserApiPath(["support", "live"], "GET"), null);
});

test("live watcher refreshes on invalidation, reconnects on resume, and cleans up", async t => {
  const saved = { fetch: globalThis.fetch, document: globalThis.document, window: globalThis.window };
  const document = new EventTarget(); document.hidden = false;
  globalThis.document = document; globalThis.window = new EventTarget();
  const streams = []; let stop; let loads = 0; let aborted = 0;
  const flush = async () => { for (let i = 0; i < 6; i++) await new Promise(resolve => setImmediate(resolve)); };
  globalThis.fetch = async (url, options) => {
    if (url === "/api/v1/session/csrf") return Response.json({ csrfToken: "9999999999.test" });
    assert.equal(url, "/api/support/live");
    assert.equal(options.headers.get("X-Support-Token"), "private-key");
    return new Response(new ReadableStream({ start(controller) {
      streams.push(controller);
      options.signal.addEventListener("abort", () => { aborted++; try { controller.close(); } catch { /* Already cancelled. */ } }, { once: true });
    } }), { headers: { "Content-Type": "text/event-stream" } });
  };
  clearCsrf();
  t.after(() => { stop?.(); Object.assign(globalThis, saved); clearCsrf(); });
  stop = watchSupportLive({ refresh: async () => { loads++; }, subscription: () => ({ conversationId: "ticket" }), secret: "private-key" });
  await flush();
  const emit = value => streams.at(-1).enqueue(new TextEncoder().encode(value));
  emit("event: ready\ndata: {}\n\n"); await flush();
  const before = loads;
  emit("event: changed\ndata: {}\n\n"); await flush(); assert.ok(loads > before);
  document.hidden = true; document.dispatchEvent(new Event("visibilitychange")); await flush();
  assert.equal(aborted, 1);
  document.hidden = false; document.dispatchEvent(new Event("visibilitychange")); await flush();
  assert.equal(streams.length, 2);
  globalThis.window.dispatchEvent(new Event(SUPPORT_CHANGED)); await flush(); assert.equal(streams.length, 3);
  stop(); await flush(); const finalLoads = loads;
  globalThis.window.dispatchEvent(new Event("focus")); await flush(); assert.equal(loads, finalLoads);
  assert.equal(aborted, 3);
});
