// UI expiry only. The API verifies the signature and current account access.
export const SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
export const ACCESS_LIFETIME_SECONDS = 15 * 60;
export const MAX_TIMER_DELAY = 2 ** 31 - 1;

export function decodeSessionToken(token) {
  try {
    if (typeof token !== "string" || token.split(".").length !== 3) return null;
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="));
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))));
    return decoded && typeof decoded === "object" && !Array.isArray(decoded) ? decoded : null;
  } catch { return null; }
}

export function sessionExpiration(token) {
  const claims = decodeSessionToken(token);
  if (!Number.isSafeInteger(claims?.auth_time) || claims.auth_time <= 0 ||
      claims.token_use !== "access" || typeof claims.sid !== "string" || !/^[\da-f-]{36}$/.test(claims.sid) ||
      !Number.isSafeInteger(claims.session_exp) || claims.session_exp < claims.auth_time + SESSION_LIFETIME_SECONDS ||
      claims.session_exp > Math.max(claims.auth_time + SESSION_LIFETIME_SECONDS, claims.iat + 3600) ||
      !Number.isSafeInteger(claims.exp) || claims.exp > claims.iat + ACCESS_LIFETIME_SECONDS || claims.exp > claims.session_exp ||
      !Number.isSafeInteger(claims.iat) || claims.iat < claims.auth_time || claims.iat >= claims.exp ||
      claims.iss !== "bgsnl-api" || claims.aud !== "bgsnl-website") return null;
  return claims.session_exp * 1000;
}

export function isSessionTokenValid(token, { now = Date.now(), version = 1 } = {}) {
  const expiration = sessionExpiration(token);
  const claims = decodeSessionToken(token);
  return expiration !== null && expiration > now && claims.auth_time * 1000 <= now &&
    claims.iat * 1000 <= now + 30000 && claims.version === Number(version);
}

// Ordinary claim refreshes must not trigger a reload loop between open tabs.
export function sameLoginSession(left, right) {
  const a = decodeSessionToken(left), b = decodeSessionToken(right);
  return !!a && !!b && a.userId === b.userId && a.auth_time === b.auth_time &&
    a.sid === b.sid && a.sessionVersion === b.sessionVersion && a.version === b.version;
}

// Re-arm long timers: 30 days exceeds the browser's signed 32-bit timeout limit.
export function watchSessionExpiry(token, onExpire, {
  now = Date.now, schedule = setTimeout, cancel = clearTimeout,
} = {}) {
  let timer;
  let stopped = false;
  function check() {
    cancel(timer);
    if (stopped) return;
    const remaining = (sessionExpiration(token) ?? 0) - now();
    if (remaining <= 0) { stopped = true; onExpire(); return; }
    timer = schedule(check, Math.min(remaining, MAX_TIMER_DELAY));
  }
  check();
  return { check, stop() { stopped = true; cancel(timer); } };
}
