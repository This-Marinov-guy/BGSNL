import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { decodeSessionToken, isSessionTokenValid } from "../functions/session-token.mjs";

export const cookieNames = (production) => ({
  session: production ? "__Host-bgsnl-session" : "bgsnl-session",
  refresh: production ? "__Host-bgsnl-refresh" : "bgsnl-refresh",
  csrf: production ? "__Host-bgsnl-csrf" : "bgsnl-csrf",
});
export const cookieOptions = (production) => ({ httpOnly: true, secure: production, sameSite: "lax", path: "/" });
const equal = (a, b) => {
  const x = Buffer.from(a || ""), y = Buffer.from(b || "");
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
};
export const allowedWebsiteOrigin = (origin, production) => {
  if (["https://www.bulgariansociety.nl", "https://bulgariansociety.nl"].includes(origin)) return true;
  return !production && /^http:\/\/(localhost|127\.0\.0\.1):300[0-2]$/.test(origin || "");
};
export function publicSession(token, now = Date.now(), { allowExpired = false } = {}) {
  const claims = decodeSessionToken(token);
  if (!claims || !isSessionTokenValid(token, { now: allowExpired ? claims.iat * 1000 : now, version: process.env.NEXT_PUBLIC_AUTH_VERSION ?? 1 })) return null;
  if (typeof claims.userId !== "string" || !Array.isArray(claims.roles)) return null;
  return { ...Object.fromEntries(["userId", "roles", "name", "surname", "email", "image", "region", "status", "version", "sessionVersion", "auth_time", "sid"]
    .map((key) => [key, claims[key]])), exp: claims.session_exp, accessExp: claims.exp };
}
const binding = (token, now) => {
  const session = publicSession(token, now, { allowExpired: true });
  return session ? `${session.sid}:${session.sessionVersion}` : "anonymous";
};
const mac = (secret, value, token, now) => {
  if (typeof secret !== "string" || secret.length < 32) throw new Error("Website server key is missing or too short");
  return createHmac("sha256", secret).update(`bgsnl-csrf:${binding(token, now)}:${value}`).digest("base64url");
};
export function createCsrf(secret, token, now = Date.now()) {
  const value = `${Math.floor(now / 1000) + 3600}.${randomBytes(32).toString("base64url")}`;
  return `${value}.${mac(secret, value, token, now)}`;
}
export function validCsrf(value, secret, token, now = Date.now()) {
  if (typeof value !== "string" || !/^\d{10}\.[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const [expires, nonce, signature] = value.split(".");
  return Number(expires) > Math.floor(now / 1000) && Number(expires) <= Math.floor(now / 1000) + 3600 &&
    equal(signature, mac(secret, `${expires}.${nonce}`, token, now));
}
export function requireBrowserMutation(request, cookie, secret, token, production) {
  const origin = request.headers.get("origin");
  if (!allowedWebsiteOrigin(origin, production) || origin !== new URL(request.url).origin ||
      ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site")) ||
      !equal(cookie, request.headers.get("x-csrf-token")) || !validCsrf(cookie, secret, token)) {
    throw new Error("Request verification expired or failed. Please try again.");
  }
}
