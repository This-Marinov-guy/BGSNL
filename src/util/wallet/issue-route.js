import "server-only";
import { websiteApi } from "@/util/auth/website-api";
import { createApplePass, createGoogleSaveUrl, walletPacketFromProxy, walletReadiness, walletResponseHeaders } from "./issuance.mjs";

function failure(request, provider, response) {
  // Safari must receive the native pass through navigation. On an HTTP error,
  // return to Settings with a fixed error code, not a raw JSON error document.
  if (provider !== "apple" || !(request.headers.get("sec-fetch-mode") === "navigate" ||
      request.headers.get("accept")?.includes("text/html"))) return response;
  const code = response.status === 401 ? "session" : response.status === 403 || response.status === 404 ? "unavailable" : "prepare";
  const headers = new Headers(response.headers);
  headers.delete("content-type");
  headers.delete("content-length");
  headers.set("Location", new URL(`/user?walletError=${code}#settings`, request.url).href);
  return new Response(null, { status: 303, headers });
}

export async function issueWallet(request, provider) {
  // The website proxy enforces session authentication and CSRF for Google POST.
  let headers = new Headers(walletResponseHeaders);
  try {
    const response = await websiteApi(request, ["user", "wallet", provider]);
    if (!response.ok) return failure(request, provider, response);
    headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(walletResponseHeaders)) headers.set(key, value);
    if (!(await walletReadiness())[provider]?.available) return failure(request, provider,
      Response.json({ message: "Wallet issuance is not enabled yet." }, { status: 503, headers }));
    const packet = walletPacketFromProxy(await response.json());
    // UI locks are only hints: enforce the reconciled membership state here.
    if (packet.card.status !== "active") return failure(request, provider,
      Response.json({ message: "An active membership is required to download a wallet card." }, { status: 403, headers }));
    if (provider === "google") return Response.json({ saveUrl: await createGoogleSaveUrl(packet) }, { headers });
    const pass = await createApplePass(packet);
    headers.set("Content-Type", "application/vnd.apple.pkpass");
    headers.set("Content-Disposition", 'attachment; filename="bgsnl-membership.pkpass"');
    return new Response(new Uint8Array(pass), { headers });
  } catch {
    return failure(request, provider, Response.json({ message: "Your wallet card could not be prepared. Please try again later." }, { status: 503, headers }));
  }
}
