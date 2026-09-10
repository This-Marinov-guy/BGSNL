import { csrfHeaders, clearCsrf } from "../../src/util/auth/browser-request.mjs";

// Transport-unit tests begin with an established CSRF cookie. Bootstrap,
// binding, rotation and missing-cookie failures have their own boundary tests.
export async function primeCsrf() {
  clearCsrf();
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ csrfToken: `${Math.floor(Date.now() / 1000) + 3600}.test.csrf` });
  try { await csrfHeaders("POST"); } finally { globalThis.fetch = original; }
}
