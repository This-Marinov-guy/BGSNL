import test from "node:test";
import assert from "node:assert/strict";
import { createPublicReader } from "../src/util/api/public-reader.mjs";

const reader = (fetcher, options = {}) => createPublicReader({ baseUrls: ["http://api.invalid"], headers: {}, fetcher, ...options });

test("successful public reads keep cache tags and return content", async () => {
  const read = reader(async (url, options) => {
    assert.equal(url, "http://api.invalid/event/events-list");
    assert.deepEqual(options.next, { revalidate: 300, tags: ["public-events"] });
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ events: [{ id: "test" }] });
  });
  assert.deepEqual(await read("event/events-list", { tags: ["public-events"] }), { events: [{ id: "test" }] });
});

test("offline, failed and malformed API responses degrade without throwing", async () => {
  for (const fetcher of [
    async () => { throw new TypeError("fetch failed"); },
    async () => new Response("Maintenance", { status: 503 }),
    async () => new Response("Rate limited", { status: 429 }),
    async () => new Response("Forbidden", { status: 403 }),
    async () => new Response("<html>Proxy error</html>"),
    async () => Response.json(null),
  ]) {
    assert.equal(await reader(fetcher)("event/events-list"), undefined);
  }
});

test("only a genuine 404 is treated as missing content", async () => {
  assert.equal(await reader(async () => new Response(null, { status: 404 }))("event/missing"), null);
  assert.equal(await reader(async () => new Response(null, { status: 500 }))("event/missing"), undefined);
});

test("missing production credentials never send an unprotected API request", async () => {
  const notices = [];
  const read = reader(() => { assert.fail("Must not call upstream"); }, { enabled: false, report: info => notices.push(info) });
  assert.equal(await read("wordpress/posts"), undefined);
  assert.deepEqual(notices, [{ endpoint: "wordpress/posts", reason: "configuration" }]);
});

test("timeouts end the read and do not continue with another long request", async () => {
  let calls = 0;
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    const read = reader((_url, { signal }) => new Promise((_resolve, reject) => {
      calls++;
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    }), { baseUrls: ["http://api.invalid", "http://fallback.invalid"] });
    assert.equal(await read("common/get-about-data", { timeout: 20 }), undefined);
    assert.equal(calls, 1);
  } finally { clearTimeout(keepAlive); }
});

test("an outage is not retained after the API recovers", async () => {
  let online = false;
  const read = reader(async () => {
    if (!online) throw new Error("offline");
    return Response.json({ posts: [{ id: 42 }] });
  });
  assert.equal(await read("wordpress/posts"), undefined);
  online = true;
  assert.deepEqual(await read("wordpress/posts"), { posts: [{ id: 42 }] });
});
