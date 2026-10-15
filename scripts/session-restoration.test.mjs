import assert from "node:assert/strict";
import test from "node:test";
import { restoreInitialSession } from "../src/util/auth/session-restoration.mjs";

const response = (status, body) => ({ status, ok: status >= 200 && status < 300,
  json: async () => body });

test("temporary startup errors keep the session pending until authenticated restoration succeeds", async () => {
  const outcomes = [response(503), new Error("network down"), response(200, { session: { userId: "member", roles: ["member"], exp: 1800000000 } })];
  const delays = [], paths = [];
  const result = await restoreInitialSession("/api/session/current", {
    signal: new AbortController().signal,
    request: async (path) => { paths.push(path); const next = outcomes.shift(); if (next instanceof Error) throw next; return next; },
    wait: async (delay) => { delays.push(delay); return true; },
  });
  assert.equal(result.kind, "authenticated");
  assert.equal(result.data.session.userId, "member");
  assert.deepEqual(delays, [1000, 2000]);
  assert.deepEqual(paths, Array(3).fill("/api/session/current"));
});

test("only a confirmed anonymous response or 401 finishes startup as a guest", async () => {
  for (const terminal of [response(200, { session: null }), response(401)]) {
    const result = await restoreInitialSession("/api/session/current", {
      request: async () => terminal,
      wait: async () => { throw new Error("should not retry"); },
    });
    assert.deepEqual(result, { kind: "anonymous" });
  }
});

test("malformed success responses retry and an aborted restoration does not finish", async () => {
  const outcomes = [response(200, {}), response(200, { session: { userId: "member" } }), response(200, { session: null })];
  assert.deepEqual(await restoreInitialSession("/api/session/current", {
    request: async () => outcomes.shift(), wait: async () => true,
  }), { kind: "anonymous" });

  const controller = new AbortController();
  const result = await restoreInitialSession("/api/session/current", {
    signal: controller.signal,
    request: async () => response(503),
    wait: async () => { controller.abort(); return false; },
  });
  assert.equal(result, null);
});
