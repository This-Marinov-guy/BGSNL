import assert from "node:assert/strict";
import test from "node:test";
import { decodeSessionToken, isSessionTokenValid, sessionExpiration, sameLoginSession, watchSessionExpiry, MAX_TIMER_DELAY, SESSION_LIFETIME_SECONDS } from "../src/util/functions/session-token.mjs";

const now = 1800000000000;
const claims = { userId: "fixture", name: "България", roles: ["member"], version: 1, sessionVersion: 0, iss: "bgsnl-api", aud: "bgsnl-website",
  token_use: "access", sid: "00000000-0000-4000-8000-000000000001", auth_time: now / 1000, iat: now / 1000,
  exp: now / 1000 + 900, session_exp: now / 1000 + SESSION_LIFETIME_SECONDS };
const token = (change = {}) => `header.${Buffer.from(JSON.stringify({ ...claims, ...change })).toString("base64url")}.signature`;

test("safe JWT decoding handles Unicode, base64url and malformed storage", () => {
  assert.equal(decodeSessionToken(token()).name, "България");
  for (const value of [null, "", "invalid", "a.b.c", {}, "a.W10.c"]) assert.equal(decodeSessionToken(value), null);
});
test("session metadata remains usable when access expires and preserves the original login age", () => {
  const original = token(), refreshed = token({ iat: now / 1000 + 29 * 86400, exp: now / 1000 + 29 * 86400 + 900 });
  const expiresAt = now + SESSION_LIFETIME_SECONDS * 1000;
  assert.equal(sessionExpiration(original), expiresAt);
  assert.equal(sessionExpiration(refreshed), expiresAt);
  assert.equal(isSessionTokenValid(original, { now: expiresAt - 1 }), true);
  assert.equal(isSessionTokenValid(refreshed, { now: expiresAt }), false);
  for (const change of [{ auth_time: undefined }, { exp: claims.exp + 1 }, { iss: "other" }, { aud: "other" }, { version: 0 }, { iat: claims.exp + 1 }]) assert.equal(isSessionTokenValid(token(change), { now }), false);
});
test("long-lived sessions use safe timer chunks and expire only once", () => {
  let clock = now, callback, delay, expired = 0;
  const watcher = watchSessionExpiry(token(), () => { expired++; }, { now: () => clock, schedule: (fn, ms) => { callback = fn; delay = ms; return 1; }, cancel: () => {} });
  assert.equal(delay, MAX_TIMER_DELAY);
  clock += MAX_TIMER_DELAY; callback();
  assert.equal(expired, 0);
  assert.equal(delay, claims.session_exp * 1000 - clock);
  clock = claims.session_exp * 1000; callback(); watcher.check();
  assert.equal(expired, 1);
});
test("focus/visibility checks catch expiry after browser sleep; cleanup cancels it", () => {
  let clock = now, expired = 0;
  const options = { now: () => clock, schedule: () => 1, cancel: () => {} };
  const watcher = watchSessionExpiry(token(), () => { expired++; }, options);
  clock = claims.session_exp * 1000 + 1; watcher.check();
  assert.equal(expired, 1);
  clock = now;
  const stopped = watchSessionExpiry(token(), () => { expired++; }, options);
  stopped.stop(); clock = claims.session_exp * 1000; stopped.check();
  assert.equal(expired, 1);
});
test("normal refreshes do not cause cross-tab reload loops; security changes do", () => {
  assert.equal(sameLoginSession(token(), token({ iat: claims.iat + 10 })), true);
  for (const change of [{ sessionVersion: 1 }, { userId: "another" }, { auth_time: claims.auth_time + 1 }, { version: 2 }]) assert.equal(sameLoginSession(token(), token(change)), false);
  assert.equal(sameLoginSession(token(), null), false);
});
