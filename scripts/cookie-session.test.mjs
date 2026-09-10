import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { isIP } from "node:net";
import { NextResponse } from "next/server.js";
import { createSlice } from "@reduxjs/toolkit";
import * as cookiesPolicy from "../src/util/auth/cookie-policy.mjs";
import * as proxyPolicy from "../src/util/auth/proxy-policy.mjs";
import * as sessionPolicy from "../src/util/auth/browser-session.mjs";
import * as browserTransport from "../src/util/auth/browser-request.mjs";

const origin = "https://www.bulgariansociety.nl", key = "isolated-website-server-key-32-characters-minimum";
const names = cookiesPolicy.cookieNames(true);
const sid = "00000000-0000-4000-8000-000000000001";
const refreshToken = `${sid}.0.fixture-signature`;
const token = (extra = {}) => {
  const timestamp = Math.floor(Date.now() / 1000);
  return `fixture.${Buffer.from(JSON.stringify({ userId: "member_fixture", roles: ["member"], status: "active", version: 1, sessionVersion: 0,
    token_use: "access", sid, auth_time: timestamp, iat: timestamp, exp: timestamp + 900, session_exp: (extra.auth_time ?? timestamp) + 30 * 86400,
    iss: "bgsnl-api", aud: "bgsnl-website", ...extra,
    ...(extra.accessExp ? { exp: extra.accessExp, session_exp: extra.exp } : {}) })).toString("base64url")}.signature`;
};
async function loadModule(path, dependencies, globals = {}) {
  const context = vm.createContext({ URL, Headers, Request, Response, AbortSignal, Buffer, Date, process: { env: { NODE_ENV: "production", BGSNL_SERVER_KEY: key, VERCEL: "1" } }, ...globals });
  const mod = new vm.SourceTextModule(await readFile(new URL(`../${path}`, import.meta.url), "utf8"), { context });
  await mod.link((specifier) => {
    const values = dependencies[specifier]; assert.ok(values, `Unexpected dependency ${specifier}`);
    return new vm.SyntheticModule(Object.keys(values), function () { for (const [name, value] of Object.entries(values)) this.setExport(name, value); }, { context });
  });
  await mod.evaluate(); return mod.namespace;
}
async function harness({ credential, refresh, upstream = async () => Response.json({ status: true }), env = {} } = {}) {
  const jar = new Map(), calls = [];
  if (credential) jar.set(names.session, credential);
  if (refresh) jar.set(names.refresh, refresh);
  const mod = await loadModule("src/util/auth/website-api.js", {
    "server-only": {}, "next/headers": { cookies: async () => ({ get: (name) => jar.has(name) ? { value: jar.get(name) } : undefined }) },
    "next/server": { NextResponse }, "node:net": { isIP }, "../api/server": { API_URL: "https://api.example.test/api" },
    "./cookie-policy.mjs": cookiesPolicy, "./proxy-policy.mjs": proxyPolicy,
  }, { process: { env: { NODE_ENV: "production", BGSNL_SERVER_KEY: key, VERCEL: "1", ...env } }, fetch: async (url, options) => { calls.push({ url, options }); return upstream(url, options); } });
  const request = async (path, { method = "GET", headers = {}, body, apply = true } = {}) => {
    const response = await mod.websiteApi(new Request(`${origin}/api/${path}`, { method, headers, body }), path.split("?")[0].split("/"));
    if (apply) for (const cookie of response.cookies.getAll()) { if (cookie.maxAge === 0) jar.delete(cookie.name); else jar.set(cookie.name, cookie.value); }
    return response;
  };
  const csrf = async () => (await (await request("session/csrf")).json()).csrfToken;
  const mutate = async (path, options = {}) => request(path, { method: "POST", ...options, headers: { origin, "sec-fetch-site": "same-origin", "X-CSRF-Token": await csrf(), ...options.headers } });
  return { request, mutate, csrf, calls, jar };
}

for (const path of ["security/login", "security/google/login", "security/passkeys/login"]) test(`${path} sets an HttpOnly cookie and never returns a browser bearer token`, async () => {
  const jwt = token();
  const h = await harness({ upstream: async () => Response.json({ token: jwt, refreshToken, status: "active" }) });
  const response = await h.mutate(path, { body: JSON.stringify({ fixture: true }) });
  assert.equal(response.status, 200);
  const data = await response.json(), cookie = response.cookies.get(names.session);
  assert.equal(data.token, undefined); assert.equal(data.session.userId, "member_fixture"); assert.ok(!JSON.stringify(data).includes(jwt));
  assert.equal(data.refreshToken, undefined); assert.equal(response.cookies.get(names.refresh).value, refreshToken);
  assert.equal(response.cookies.get(names.refresh).httpOnly, true); assert.equal(response.cookies.get(names.refresh).secure, true);
  assert.equal(cookie.value, jwt); assert.equal(cookie.httpOnly, true); assert.equal(cookie.secure, true); assert.equal(cookie.sameSite, "lax");
  assert.equal(cookie.path, "/"); assert.equal(cookie.domain, undefined); assert.equal(cookie.expires.getTime(), data.session.exp * 1000);
  assert.match(response.headers.get("cache-control"), /no-store/); assert.equal(response.headers.get("x-bgsnl-session-changed"), "1");
  assert.equal(h.calls[0].options.headers.get("authorization"), null);
});
test("requests without correct CSRF and same-origin proof never reach the API", async () => {
  const h = await harness({ credential: token() }); const csrf = await h.csrf();
  for (const headers of [{}, { origin }, { origin, "x-csrf-token": "forged" }, { origin: "https://evil.test", "x-csrf-token": csrf },
    { origin: "https://bulgariansociety.nl", "x-csrf-token": csrf }, { origin, "x-csrf-token": csrf, "sec-fetch-site": "same-site" },
    { origin, "x-csrf-token": csrf, "sec-fetch-site": "cross-site" }]) {
    assert.equal((await h.request("user/edit-info", { method: "PATCH", headers, body: "{}" })).status, 403);
    assert.equal((await h.request("session/logout", { method: "POST", headers })).status, 403);
  }
  assert.equal(h.calls.length, 0); assert.ok(h.jar.get(names.session));
});
test("CSRF values are signed, expiring, session-bound and survive ordinary claim refresh", () => {
  const jwt = token(), csrf = cookiesPolicy.createCsrf(key, jwt);
  assert.equal(cookiesPolicy.validCsrf(csrf, key, jwt), true);
  const claims = cookiesPolicy.publicSession(jwt);
  assert.equal(cookiesPolicy.validCsrf(csrf, key, token({ ...claims, name: "Updated" })), true);
  assert.equal(cookiesPolicy.validCsrf(csrf, key, token({ ...claims, userId: "alumni_migrated" })), true);
  for (const other of [undefined, token({ sid: "00000000-0000-4000-8000-000000000002" }), token({ sessionVersion: 1 })]) assert.equal(cookiesPolicy.validCsrf(csrf, key, other), false);
  assert.equal(cookiesPolicy.validCsrf(csrf, `${key}-different`, jwt), false);
  assert.equal(cookiesPolicy.validCsrf(csrf.replace(/.$/, "!"), key, jwt), false);
  assert.equal(cookiesPolicy.validCsrf(csrf, key, jwt, Date.now() + 3600001), false);
});
test("API receives only the cookie credential, never attacker Authorization or arbitrary forwarded headers", async () => {
  const jwt = token(), h = await harness({ credential: jwt });
  await h.request("user/current", { headers: { Authorization: "Bearer forged", Cookie: "unrelated=secret", "x-bgsnl-server-key": "forged", "x-bgsnl-client-ip": "192.0.2.99", "x-forwarded-for": "192.0.2.10" } });
  const headers = h.calls[0].options.headers;
  assert.equal(headers.get("authorization"), `Bearer ${jwt}`); assert.equal(headers.get("cookie"), null);
  assert.equal(headers.get("x-bgsnl-server-key"), key); assert.equal(headers.get("x-bgsnl-client-ip"), "192.0.2.10");
  assert.equal(h.calls[0].options.redirect, "manual");
});
test("non-Vercel deployments do not trust client-supplied forwarding headers by default", async () => {
  const h = await harness({ env: { VERCEL: undefined } });
  await h.request("event/events-list", { headers: { "x-forwarded-for": "192.0.2.10", "x-bgsnl-client-ip": "192.0.2.10" } });
  assert.equal(h.calls[0].options.headers.get("x-bgsnl-client-ip"), null);
});
test("public read routes still work anonymously, preserving versions, dynamic parameters and query strings", async () => {
  const h = await harness();
  for (const path of ["event/events-list", "v1/event/event-details/fixture-id?region=groningen"]) {
    assert.equal((await h.request(path)).status, 200);
    assert.equal(h.calls.at(-1).options.headers.get("Authorization"), null);
  }
  assert.equal(h.calls.at(-1).url.href, "https://api.example.test/api/v1/event/event-details/fixture-id?region=groningen");
  assert.equal((await h.request("session/current")).status, 200); assert.equal(h.calls.length, 2);
});
test("anonymous public submissions and guest support use CSRF without requiring a login", async () => {
  const h = await harness();
  assert.equal((await h.mutate("support/conversations", { headers: { "x-support-token": "guest-only-secret", "content-type": "application/json" }, body: "{}" })).status, 200);
  assert.equal(h.calls[0].options.headers.get("x-support-token"), "guest-only-secret");
  assert.equal(h.calls[0].options.headers.get("authorization"), null);
});
test("webhooks and service-only paths are absent from the browser proxy", async () => {
  const h = await harness();
  for (const path of ["payment/webhook", "payment/subscription/webhook", "google-scripts/update", "mobile/login", "payment/result",
    "event/sync-calendar-events", "user/export-vital-stats", "user/EXPORT-VITAL-STATS", "v2/user/current", "user/%2e%2e/security", "https://evil.test"]) {
    assert.equal((await h.mutate(path)).status, 404, path);
  }
  assert.equal(h.calls.length, 0);
});
test("restoration uses API-verified current account identity and never discloses a JWT", async () => {
  const h = await harness({ credential: token(), upstream: async () => Response.json({ userId: "alumni_current", roles: ["alumni"], status: "locked", email: "new@example.test" }) });
  const data = await (await h.request("session/current")).json();
  assert.equal(data.session.userId, "alumni_current"); assert.deepEqual(data.session.roles, ["alumni"]);
  assert.equal(data.session.status, "locked"); assert.equal(data.token, undefined);
});
test("expired cookies are not forwarded or restored and revoked cookies clear on API 401", async () => {
  const timestamp = Math.floor(Date.now() / 1000) - 30 * 86400 - 1;
  const expired = await harness({ credential: token({ auth_time: timestamp, iat: timestamp, exp: timestamp + 30 * 86400 }) });
  assert.equal((await (await expired.request("session/current")).json()).session, null);
  assert.equal(expired.calls.length, 0); assert.equal(expired.jar.has(names.session), false);
  const revoked = await harness({ credential: token(), upstream: async () => Response.json({ message: "Session revoked" }, { status: 401 }) });
  assert.equal((await revoked.request("user/current")).status, 401); assert.equal(revoked.jar.has(names.session), false);
});
test("profile confirmation/Google/passkey replacements cannot extend the original login window", async () => {
  const jwt = token(), claims = cookiesPolicy.publicSession(jwt);
  for (const path of ["security/profile-change/confirm", "security/google/link", "security/google/disconnect", "security/passkeys/remove"]) {
    const h = await harness({ credential: jwt, upstream: async () => Response.json({ token: token({ ...claims, sessionVersion: 1 }), refreshToken }) });
    const response = path === "user/refresh-token" ? await h.request(path) : await h.mutate(path);
    assert.equal(response.status, 200); assert.equal((await response.json()).session.exp, claims.exp);
  }
  const invalid = await harness({ credential: jwt, upstream: async () => Response.json({ token: token({ ...claims, auth_time: claims.auth_time + 1, exp: claims.exp + 1 }) }) });
  assert.equal((await invalid.mutate("security/profile-change/confirm")).status, 401);
  assert.equal(invalid.jar.has(names.session), false);
});
test("an email link in an anonymous browser cannot create a login cookie", async () => {
  const h = await harness({ upstream: async () => Response.json({ state: "complete", message: "Confirmed" }) });
  const response = await h.mutate("security/profile-change/confirm");
  assert.equal(response.status, 200); assert.equal(response.cookies.get(names.session), undefined);
});
test("logout revokes the API grant before clearing all cookies", async () => {
  const h = await harness({ credential: token(), refresh: refreshToken });
  assert.equal((await h.mutate("session/logout")).status, 200);
  assert.equal(h.jar.size, 0); assert.equal(h.calls.length, 1);
  assert.match(h.calls[0].url.pathname, /security\/session\/logout$/);
  assert.deepEqual(JSON.parse(h.calls[0].options.body), { refreshToken });
});
test("multipart upload bytes are preserved; upstream redirects and HTML do not become website code", async () => {
  const body = "--fixture\r\nContent-Disposition: form-data; name=\"phone\"\r\n\r\n+31123456789\r\n--fixture--";
  const h = await harness();
  await h.mutate("user/edit-info", { method: "PATCH", body, headers: { "content-type": "multipart/form-data; boundary=fixture" } });
  assert.equal(h.calls[0].options.body.toString(), body);
  assert.equal(h.calls[0].options.headers.get("content-type"), "multipart/form-data; boundary=fixture");
  const redirects = await harness({ upstream: async () => new Response(null, { status: 302, headers: { location: "https://evil.test" } }) });
  assert.equal((await redirects.request("common/get-about-data")).status, 502);
  const html = await harness({ upstream: async () => new Response("<script>bad()</script>", { headers: { "content-type": "text/html" } }) });
  const response = await html.request("common/get-about-data");
  assert.equal(response.headers.get("content-disposition"), "attachment"); assert.match(response.headers.get("content-security-policy"), /sandbox/);
});
test("bounded bodies, missing configuration, rate limits and network failures fail safely", async () => {
  await assert.rejects(proxyPolicy.boundedBody(new Response("12345").body, 4), /too large/);
  const missing = await harness({ env: { BGSNL_SERVER_KEY: "" } });
  assert.equal((await missing.request("session/csrf")).status, 503); assert.equal(missing.calls.length, 0);
  const failed = await harness({ upstream: async () => { throw new Error("upstream-key-and-url"); } });
  const response = await failed.request("user/current"); assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /upstream-key/);
  const limited = await harness({ upstream: async () => Response.json({ message: "Slow down" }, { status: 429, headers: { "retry-after": "60" } }) });
  assert.equal((await limited.request("common/get-about-data")).headers.get("retry-after"), "60");
});
test("client transport bootstraps CSRF once, strips bearer headers, and never replays failed mutations", async (t) => {
  browserTransport.clearCsrf(); const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return url === "/api/session/csrf" ? Response.json({ csrfToken: `${Math.floor(Date.now() / 1000) + 3600}.fixture.csrf` }) : Response.json({}, { status: 403 });
  });
  await browserTransport.browserFetch("/api/user/edit-info", { method: "PATCH", headers: { Authorization: "Bearer do-not-forward" } });
  assert.equal(calls.length, 2); assert.equal(calls[1].options.credentials, "same-origin");
  assert.equal(calls[1].options.headers.get("authorization"), null); assert.ok(calls[1].options.headers.get("x-csrf-token"));
  await browserTransport.browserFetch("/api/user/edit-info", { method: "PATCH" }); assert.equal(calls.length, 4);
  await assert.rejects(browserTransport.browserFetch("https://evil.test/api/user")); assert.equal(calls.length, 4);
});
test("cancelling while CSRF is loading prevents the mutation", async (t) => {
  browserTransport.clearCsrf(); let finish, calls = 0;
  t.mock.method(globalThis, "fetch", () => { calls++; return new Promise((resolve) => { finish = resolve; }); });
  const controller = new AbortController();
  const request = browserTransport.browserFetch("/api/security/google/link", { method: "POST", signal: controller.signal });
  controller.abort(); finish(Response.json({ csrfToken: "1800000000.fixture.csrf" }));
  await assert.rejects(request, (e) => e.name === "AbortError"); assert.equal(calls, 1); browserTransport.clearCsrf();
});
test("Redux retains only public session metadata and restores roles without a storage credential", async () => {
  const mod = await loadModule("src/redux/user.js", { "@reduxjs/toolkit": { createSlice }, "../util/auth/browser-session.mjs": sessionPolicy, "../util/auth/browser-request.mjs": browserTransport });
  const session = cookiesPolicy.publicSession(token());
  const state = mod.default(undefined, mod.login({ session, token: "must-not-be-kept" }));
  assert.equal(state.token, undefined); assert.deepEqual(state.roles, ["member"]); assert.equal(state.status, "active");
  assert.equal(mod.selectIsAuth({ user: state }), true);
  assert.equal(mod.default(state, mod.refreshSession({ ...session, exp: session.exp + 1 })).session.exp, session.exp + 1);
  assert.equal(mod.default(state, mod.refreshSession({ ...session, sid: "other", exp: session.exp + 1 })).session.exp, session.exp);
  assert.equal(mod.selectIsAuth({ user: mod.default(state, mod.clearSession()) }), false);
  const previous = mod.default(state, mod.updateAccount({ hasBenefits: true, memberDiscount: true }));
  const switched = mod.default(previous, mod.login({ session: { ...session, userId: "other" } }));
  assert.equal(switched.hasBenefits, false); assert.equal(switched.memberDiscount, false);
});
test("long-lived UI session timers use bounded chunks and expire exactly once", () => {
  let clock = 1000, delay, callback, expired = 0;
  const session = { exp: 30 * 86400 + 1 };
  const watcher = sessionPolicy.watchSessionDeadline(session, () => { expired++; }, { now: () => clock, schedule: (fn, ms) => { callback = fn; delay = ms; }, cancel: () => {} });
  assert.equal(delay, 2 ** 31 - 1); clock += delay; callback();
  assert.ok(delay < 2 ** 31 - 1); clock = session.exp * 1000; callback(); watcher.check();
  assert.equal(expired, 1); watcher.stop();
});
test("confirmation uses a fragment, explicit approval and a one-time profile toast; old browser JWTs are purged", async () => {
  const source = await readFile(new URL("../src/elements/authentication/ConfirmProfileChange.jsx", import.meta.url), "utf8");
  assert.match(source, /window\.location\.hash/); assert.match(source, /window\.history\.replaceState/);
  assert.match(source, /onClick=\{confirm\}/); assert.match(source, /method: "POST"/); assert.match(source, /window\.location\.replace\("\/user#profile"\)/);
  assert.match(source, /if \(initialized\.current\) return/); assert.match(source, /SESSION_NOTICE_KEY/);
  const init = await readFile(new URL("../src/hooks/session/app-init.js", import.meta.url), "utf8");
  assert.match(init, /localStorage\.removeItem\("BGSNL_user_data"\)/);
  assert.doesNotMatch(init, /localStorage\.getItem/);
  const ui = await readFile(new URL("../src/screens/authentication/User.jsx", import.meta.url), "utf8");
  assert.match(ui, /sessionStorage\.removeItem\(SESSION_NOTICE_KEY\)/); assert.match(ui, /showNotification\(\{ severity: notice.severity/);
});

test("the website manifest covers existing API browser routes but not integration/admin-only jobs", async () => {
  const routeFiles = { security: "security-routes.js", user: "users-routes.js", common: "common-routes.js", event: "Events/events-routes.js",
    "future-event": "Events/future-events-routes.js", payment: "payments-routes.js", internship: "internship-routes.js", dashboard: "dashboard-routes.js",
    backoffice: "backoffice-routes.js", support: "support-routes.js", wordpress: "Integration/wordpress-routes.js", contest: "contest-routes.js", special: "special-routes.js" };
  const privatePaths = ["payment/result", "user/export-vital-stats", "event/sync-calendar-events", "security/session/refresh", "security/session/activity", "security/session/logout"];
  for (const [group, file] of Object.entries(routeFiles)) {
    const source = await readFile(new URL(`../../BGSNL-API/routes/${file}`, import.meta.url), "utf8");
    for (const [, method, route] of source.matchAll(/\b(?:\w*Router|router)\.(get|post|patch|delete)\(\s*["']([^"']+)["']/g)) {
      const path = group + route.replace(/:[A-Za-z]+/g, "fixture");
      assert.equal(proxyPolicy.browserApiPath(path.split("/"), method.toUpperCase()), privatePaths.includes(path) ? null : path, `${method} ${path}`);
    }
  }
  assert.equal(proxyPolicy.browserApiPath(["security", "login"], "GET"), null);
  assert.equal(proxyPolicy.browserApiPath(["user", "new-maintenance-job"], "POST"), null);
});
test("confirmation has no global analytics scripts", async () => {
  const analytics = await readFile(new URL("../src/component/common/WebsiteAnalytics.jsx", import.meta.url), "utf8");
  assert.match(analytics, /pathname === "\/account\/confirm"\) return null/);
  const helpers = await readFile(new URL("../src/util/functions/helpers.js", import.meta.url), "utf8");
  for (const name of ["gaTrack", "clarityTrack"]) assert.match(helpers, new RegExp(`${name} = \\(\\) => \\{\\s+if \\(window.location.pathname === "/account/confirm"\\) return`));
});

test("expired access renews before a mutation, preserves CSRF and never leaks refresh credentials", async () => {
  const timestamp = Math.floor(Date.now() / 1000), fresh = token({ auth_time: timestamp - 1000 });
  const h = await harness({ credential: token({ auth_time: timestamp - 1000, iat: timestamp - 1000, exp: timestamp - 100 }), refresh: refreshToken,
    upstream: async (url) => url.pathname.endsWith("session/refresh") ? Response.json({ token: fresh, refreshToken: `${sid}.1.successor` }) : Response.json({ status: true }) });
  const csrf = await h.csrf(), response = await h.mutate("user/edit-info", { method: "PATCH", body: "original-body" });
  assert.equal(response.status, 200); assert.equal(h.calls.length, 2);
  assert.match(h.calls[0].url.pathname, /session\/refresh$/);
  assert.equal(h.calls[1].options.headers.get("authorization"), `Bearer ${fresh}`);
  assert.equal(h.calls[1].options.body.toString(), "original-body");
  assert.equal(h.calls[1].options.headers.get("x-csrf-token"), null);
  assert.equal(h.jar.get(names.csrf), csrf); assert.equal(cookiesPolicy.validCsrf(csrf, key, fresh), true);
  assert.equal(response.headers.get("x-bgsnl-session-changed"), null);
  assert.equal(h.jar.get(names.refresh), `${sid}.1.successor`); assert.doesNotMatch(await response.text(), /successor|fixture-signature/);
});
test("mid-request expiry retries only middleware-rejected calls and executes the business write once", async () => {
  let resourceCalls = 0, writes = 0;
  const h = await harness({ credential: token(), refresh: refreshToken, upstream: async (url, options) => {
    if (url.pathname.endsWith("session/refresh")) return Response.json({ token: token(), refreshToken });
    resourceCalls++;
    if (resourceCalls === 1) return Response.json({ code: "ACCESS_TOKEN_EXPIRED" }, { status: 401 });
    assert.equal(options.body.toString(), "checkout-fixture"); writes++; return Response.json({ status: true });
  } });
  assert.equal((await h.mutate("payment/checkout/member-ticket", { body: "checkout-fixture" })).status, 200);
  assert.equal(resourceCalls, 2); assert.equal(writes, 1); assert.equal(h.calls.length, 3);
});
test("simultaneous requests share one in-flight refresh", async () => {
  const timestamp = Math.floor(Date.now() / 1000);
  let release, refreshCalls = 0;
  const h = await harness({ credential: token({ auth_time: timestamp - 1000, iat: timestamp - 1000, exp: timestamp - 100 }), refresh: refreshToken,
    upstream: async (url) => {
      if (url.pathname.endsWith("session/refresh")) { refreshCalls++; await new Promise((resolve) => { release = resolve; }); return Response.json({ token: token({ auth_time: timestamp - 1000 }), refreshToken }); }
      return Response.json({ status: true });
    } });
  const requests = Array.from({ length: 5 }, () => h.request("user/current"));
  await new Promise((resolve) => setImmediate(resolve)); assert.equal(refreshCalls, 1); release();
  for (const response of await Promise.all(requests)) assert.equal(response.status, 200);
});
test("arbitrary auth/validation failures and outages never replay a write", async () => {
  for (const status of [401, 403, 422, 500]) {
    const h = await harness({ credential: token(), refresh: refreshToken, upstream: async () => Response.json({ message: "Rejected" }, { status }) });
    assert.equal((await h.mutate("user/edit-info", { method: "PATCH", body: "{}" })).status, status);
    assert.equal(h.calls.length, 1);
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const expired = token({ auth_time: timestamp - 1000, iat: timestamp - 1000, exp: timestamp - 100 });
  for (const status of [401, 503]) {
    const h = await harness({ credential: expired, refresh: refreshToken, upstream: async () => Response.json({}, { status }) });
    assert.equal((await h.mutate("user/edit-info", { method: "PATCH", body: "{}" })).status, status);
    assert.equal(h.calls.length, 1); assert.equal(h.jar.has(names.refresh), status === 503);
  }
});
test("activity requires CSRF, preserves original login age, and can extend the day-30 deadline", async () => {
  const timestamp = Math.floor(Date.now() / 1000), auth = timestamp - 30 * 86400 + 60;
  const h = await harness({ credential: token({ auth_time: auth, exp: timestamp + 60, session_exp: timestamp + 60 }), refresh: refreshToken,
    upstream: async (url) => {
      assert.match(url.pathname, /session\/activity$/);
      return Response.json({ token: token({ auth_time: auth, session_exp: timestamp + 3600 }), refreshToken });
    } });
  assert.equal((await h.request("session/activity", { method: "POST" })).status, 403); assert.equal(h.calls.length, 0);
  const response = await h.mutate("session/activity"), data = await response.json();
  assert.equal(response.status, 200); assert.equal(data.session.auth_time, auth); assert.equal(data.session.exp, timestamp + 3600);
  assert.equal(response.cookies.get(names.refresh).expires.getTime(), (timestamp + 3600) * 1000);
});
test("server-only renewal paths cannot be invoked through the browser proxy", async () => {
  const h = await harness();
  for (const action of ["refresh", "activity", "logout"]) assert.equal((await h.mutate(`security/session/${action}`)).status, 404);
  assert.equal(h.calls.length, 0);
});
test("the legacy website refresh URL requires the refresh cookie, not just an access token", async () => {
  const missing = await harness({ credential: token() });
  assert.equal((await missing.request("user/refresh-token")).status, 401); assert.equal(missing.calls.length, 0);
  const h = await harness({ credential: token(), refresh: refreshToken, upstream: async (url) => {
    assert.match(url.pathname, /security\/session\/refresh$/);
    return Response.json({ token: token(), refreshToken });
  } });
  const response = await h.request("user/refresh-token");
  assert.equal(response.status, 200); assert.equal((await response.json()).refreshToken, undefined);
});
