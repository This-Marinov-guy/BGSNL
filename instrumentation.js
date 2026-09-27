// Next.js calls this for server render, route, action, and proxy failures.
export async function onRequestError(error, request, context) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const secret = process.env.BGSNL_SERVER_KEY;
  if (!secret || secret.length < 32) return;
  const base = process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SERVER_URL || "https://api.bulgariansociety.nl/api/"
    : process.env.NEXT_PUBLIC_TEST_SERVER_URL || "http://127.0.0.1:8080/api/";
  try {
    await fetch(`${base.replace(/\/$/, "")}/v1/monitoring/web-events`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-bgsnl-server-key": secret, "x-bgsnl-browser-proxy": "1" },
      body: JSON.stringify({ type: "server_error", path: request.path,
        name: error?.name || "Error", digest: error?.digest || "", component: context?.routeType || "server" }),
      cache: "no-store", signal: AbortSignal.timeout(3000),
    });
  } catch { /* Error reporting must not throw another request error. */ }
}
