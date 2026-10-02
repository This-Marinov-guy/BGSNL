import test from "node:test";
import assert from "node:assert/strict";
import { createRegionEmailStore } from "../src/util/region-email-store.mjs";
import { browserApiPath } from "../src/util/auth/proxy-policy.mjs";

const response = emails => ({ ok: true, json: async () => ({ emails }) });

test("directory is public read-only through the bounded website proxy", () => {
  assert.equal(browserApiPath(["v1", "common", "region-emails"], "GET"), "common/region-emails");
  assert.equal(browserApiPath(["common", "region-emails"], "POST"), null);
});

test("deduplicates requests and caches results for five minutes", async () => {
  let calls = 0, clock = 1;
  const store = createRegionEmailStore({ now: () => clock, fetcher: async (url, options) => {
    calls++;
    assert.equal(url, "/api/v1/common/region-emails");
    assert.ok(options.signal instanceof AbortSignal);
    return response({ groningen: "gro@example.com" });
  } });
  assert.equal(store.getServerSnapshot().loading, true);
  await Promise.all([store.load(), store.load(), store.load()]);
  assert.equal(calls, 1);
  assert.equal(store.getSnapshot().emails.groningen, "gro@example.com");
  await store.load();
  assert.equal(calls, 1);
  clock += 300001;
  await store.load();
  assert.equal(calls, 2);
});

test("offline and empty responses allow explicit retry without automatic request loops", async () => {
  let calls = 0;
  const store = createRegionEmailStore({ fetcher: async () => {
    calls++;
    if (calls === 1) throw new Error("offline");
    if (calls === 2) return response({});
    return response({ support: "support@example.com", invalid: "mailto:javascript:alert(1)" });
  } });
  await store.load();
  assert.deepEqual(store.getSnapshot(), { emails: {}, loading: false, error: true });
  await store.load();
  assert.equal(calls, 1);
  await store.retry();
  assert.equal(store.getSnapshot().error, true);
  await store.retry();
  assert.deepEqual(store.getSnapshot(), { emails: { support: "support@example.com" }, loading: false, error: false });
});

test("keeps last successful contact links when a refresh fails", async () => {
  let failing = false, updates = 0;
  const store = createRegionEmailStore({ fetcher: async () => failing ? { ok: false } : response({ support: "support@example.com" }) });
  const unsubscribe = store.subscribe(() => updates++);
  await store.load();
  failing = true;
  await store.retry();
  assert.equal(store.getSnapshot().emails.support, "support@example.com");
  assert.equal(store.getSnapshot().error, true);
  assert.equal(updates, 4);
  unsubscribe();
  await store.retry();
  assert.equal(updates, 4);
});
