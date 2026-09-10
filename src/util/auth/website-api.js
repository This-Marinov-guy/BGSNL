import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { API_URL } from "../api/server";
import { cookieNames, cookieOptions, publicSession, createCsrf, validCsrf, requireBrowserMutation, allowedWebsiteOrigin } from "./cookie-policy.mjs";
import { browserApiPath, changesSession, startsSession, boundedBody } from "./proxy-policy.mjs";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
const json = (data, status = 200) => NextResponse.json(data, { status, headers });
const apiUrl = (path) => new URL(`${API_URL.replace(/\/$/, "")}/v1/${path}`.replace(/\/v1\/v1\//, "/v1/"));
// In-flight only, never a session cache. Mongo's atomic rotation/grace also
// coordinates different workers, server instances and browser tabs.
const renewals = new Map();

export async function websiteApi(request, parts) {
  const production = process.env.NODE_ENV === "production";
  const names = cookieNames(production), options = cookieOptions(production);
  const jar = await cookies();
  let credential = jar.get(names.session)?.value, refresh = jar.get(names.refresh)?.value;
  let session = publicSession(credential), renewed = false;
  const original = publicSession(credential, Date.now(), { allowExpired: true });
  const secret = process.env.BGSNL_SERVER_KEY;
  const origin = new URL(request.url).origin, path = parts.join("/");
  const clear = (response) => {
    for (const name of Object.values(names)) response.cookies.set(name, "", { ...options, maxAge: 0 });
    response.headers.set("X-BGSNL-Session-Changed", "1");
    return response;
  };
  const withCredentials = (response) => {
    if (renewed) {
      const expires = new Date(session.exp * 1000);
      response.cookies.set(names.session, credential, { ...options, expires });
      response.cookies.set(names.refresh, refresh, { ...options, expires });
    }
    return response;
  };
  if (!allowedWebsiteOrigin(origin, production)) return json({ message: "Invalid website origin" }, 403);
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (request.headers.has("origin") && request.headers.get("origin") !== origin)) return json({ message: "Cross-site API requests are not allowed" }, 403);
  if (!secret || secret.length < 32) return json({ message: "Website authentication is not configured. Please contact support." }, 503);
  if (!["GET", "HEAD"].includes(request.method)) {
    try { requireBrowserMutation(request, jar.get(names.csrf)?.value, secret, credential, production); }
    catch { return json({ message: "Request verification expired or failed. Please try again." }, 403); }
  }
  if (path === "session/csrf" && request.method === "GET") {
    const saved = jar.get(names.csrf)?.value;
    const csrfToken = validCsrf(saved, secret, credential) ? saved : createCsrf(secret, credential);
    const response = json({ csrfToken });
    response.cookies.set(names.csrf, csrfToken, { ...options, maxAge: 3600 });
    return response;
  }
  const restore = path === "session/current" && request.method === "GET";
  const activity = path === "session/activity" && request.method === "POST";
  const logout = path === "session/logout" && request.method === "POST";
  const apiPath = restore ? "user/get-subscription-status" : browserApiPath(parts, request.method);
  if (!apiPath && !activity && !logout) return json({ message: "Not found" }, 404);
  const forwarded = new Headers({ "x-bgsnl-server-key": secret, "x-bgsnl-browser-proxy": "1", Origin: origin, Accept: "application/json" });
  const ipHeader = process.env.VERCEL ? "x-forwarded-for" : process.env.BGSNL_TRUSTED_CLIENT_IP_HEADER;
  const ip = ipHeader ? request.headers.get(ipHeader)?.trim() : production ? null : "127.0.0.1";
  if (ip && isIP(ip)) forwarded.set("x-bgsnl-client-ip", ip);
  async function lifecycle(action) {
    const lifecycleHeaders = new Headers(forwarded);
    lifecycleHeaders.delete("authorization");
    lifecycleHeaders.set("content-type", "application/json");
    const response = await fetch(apiUrl(`security/session/${action}`), { method: "POST", headers: lifecycleHeaders,
      body: JSON.stringify({ refreshToken: refresh }), cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Object.assign(new Error("Session renewal failed"), { status: response.status === 401 ? 401 : 503 });
    return JSON.parse((await boundedBody(response.body, 128 * 1024)).toString("utf8"));
  }
  function accept(packet, { login = false } = {}) {
    const next = publicSession(packet.token);
    if (!next || typeof packet.refreshToken !== "string" || packet.refreshToken.length > 256 ||
        !packet.refreshToken.startsWith(`${next.sid}.`) || next.accessExp * 1000 <= Date.now() ||
        (!login && (!original || next.sid !== original.sid || next.auth_time !== original.auth_time ||
          next.sessionVersion < original.sessionVersion))) throw Object.assign(new Error("Invalid session replacement"), { status: 401 });
    session = next; credential = packet.token; refresh = packet.refreshToken; renewed = true;
  }
  async function renew(isActivity = false) {
    if (!refresh || !original) throw Object.assign(new Error("No refresh credential"), { status: 401 });
    const key = `${isActivity ? "activity" : "refresh"}:${refresh}`;
    let pending = renewals.get(key);
    if (!pending) {
      pending = lifecycle(isActivity ? "activity" : "refresh");
      renewals.set(key, pending);
      pending.finally(() => { if (renewals.get(key) === pending) renewals.delete(key); }).catch(() => {});
    }
    accept(await pending);
  }
  try {
    if (logout) {
      if (refresh) await lifecycle("logout");
      return clear(json({ status: true }));
    }
    if (activity) {
      await renew(true);
      return withCredentials(json({ session }));
    }
    if (apiPath === "user/refresh-token") {
      await renew();
      return withCredentials(json({ session }));
    }
    if (restore && !original) return clear(json({ session: null }));
    const login = startsSession(apiPath);
    if (!login && original && (!session || session.accessExp * 1000 <= Date.now() + 60000)) await renew();
    if (!login && session) forwarded.set("Authorization", `Bearer ${credential}`);
    for (const name of ["content-type", "x-support-token"]) if (request.headers.has(name)) forwarded.set(name, request.headers.get(name));
    const target = apiUrl(apiPath);
    target.search = new URL(request.url).search;
    if (target.search.length > 4000) return withCredentials(json({ message: "Request is too large" }, 413));
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await boundedBody(request.body, 40 * 1024 * 1024);
    const send = () => fetch(target, { method: request.method, headers: forwarded, body,
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(60000) });
    let upstream = await send();
    // Retry only an explicit AUTH MIDDLEWARE expiry: no business handler ran.
    // Never retry arbitrary 401/403/422, network failures or completed writes.
    if (upstream.status === 401 && !login && refresh && upstream.headers.get("content-type")?.includes("application/json")) {
      const failure = JSON.parse((await boundedBody(upstream.clone().body, 128 * 1024)).toString("utf8"));
      if (failure.code === "ACCESS_TOKEN_EXPIRED") {
        await renew();
        forwarded.set("Authorization", `Bearer ${credential}`);
        upstream = await send();
      }
    }
    if (upstream.status >= 300 && upstream.status < 400) return withCredentials(json({ message: "Unexpected API redirect" }, 502));
    let response;
    if (upstream.headers.get("content-type")?.includes("application/json")) {
      const data = JSON.parse((await boundedBody(upstream.body, 20 * 1024 * 1024)).toString("utf8"));
      const packet = { token: data.token, refreshToken: data.refreshToken };
      delete data.token;
      delete data.refreshToken;
      if (restore) data.session = upstream.ok ? { ...session,
        ...Object.fromEntries(["userId", "roles", "name", "surname", "email", "status", "region", "image"]
          .filter((key) => Object.hasOwn(data, key)).map((key) => [key, data[key]])) } : null;
      if (upstream.ok && changesSession(apiPath) && packet.token) {
        accept(packet, { login });
        data.session = session;
        response = json(data, upstream.status);
        response.cookies.set(names.csrf, "", { ...options, maxAge: 0 });
        response.headers.set("X-BGSNL-Session-Changed", "1");
      } else response = json(data, upstream.status);
    } else if (upstream.ok) {
      response = new NextResponse(await boundedBody(upstream.body, 25 * 1024 * 1024), { status: upstream.status, headers });
      for (const name of ["content-type", "content-disposition"]) if (upstream.headers.has(name)) response.headers.set(name, upstream.headers.get(name));
      response.headers.set("Content-Disposition", "attachment");
      response.headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
    } else response = json({ message: "The service could not complete your request. Please try again." }, upstream.status);
    if (upstream.status === 401 && !login) return clear(response);
    if (upstream.headers.has("retry-after")) response.headers.set("Retry-After", upstream.headers.get("retry-after"));
    return withCredentials(response);
  } catch (error) {
    if (error.status === 401) return clear(json({ message: "Your session has ended. Please sign in again." }, 401));
    // Outages retain credentials and form state so a retry is possible.
    return withCredentials(json({ message: "The service is temporarily unavailable. Please try again." }, 503));
  }
}
