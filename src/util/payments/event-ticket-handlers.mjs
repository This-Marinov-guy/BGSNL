import { boundedBody } from "../auth/proxy-policy.mjs";
import { EVENT_TICKET_COOKIE_SECONDS, eventTicketCookieName, eventTicketPath, validEventTicketToken } from "./event-ticket-policy.mjs";

export const eventTicketPrivacyHeaders = {
  "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff",
};

export const createTicketEntryHandler = ({ randomId, secure }) => request => {
  if (request.method === "HEAD") return new Response(null, { status: 204, headers: eventTicketPrivacyHeaders });
  const token = new URL(request.url).searchParams.get("token");
  const id = randomId();
  const name = eventTicketCookieName(id);
  if (!name) throw new Error("Invalid checkout identifier");
  const headers = new Headers(eventTicketPrivacyHeaders);
  headers.set("Location", new URL(eventTicketPath(id), request.url).href);
  if (validEventTicketToken(token)) headers.set("Set-Cookie", `${name}=${token}; Max-Age=${EVENT_TICKET_COOKIE_SECONDS}; Path=${eventTicketPath(id)}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`);
  return new Response(null, { status: 303, headers });
};

export const createTicketPaymentHandler = ({ checkoutRequest }) => async (request, { params }) => {
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ message: "Please continue from your ticket preferences page." }, { status: 403, headers: eventTicketPrivacyHeaders });
  }
  let choices;
  try {
    const body = await boundedBody(request.body, 16384);
    const parsed = JSON.parse(body.toString("utf8"));
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Invalid body");
    // Never forward client tokens, identities, prices, quantities or destinations.
    choices = { addOns: parsed.addOns, preferences: parsed.preferences, revision: parsed.revision };
  } catch { return Response.json({ message: "Please check your ticket preferences." }, { status: 422, headers: eventTicketPrivacyHeaders }); }
  try {
    const { checkout } = await params;
    if (!eventTicketCookieName(checkout)) return Response.json({ message: "This ticket link is invalid." }, { status: 410, headers: eventTicketPrivacyHeaders });
    const result = await checkoutRequest(checkout, "checkout", choices);
    const url = new URL(result.url);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.username || url.password) throw new Error("Invalid checkout destination");
    return Response.json({ url: url.href }, { headers: eventTicketPrivacyHeaders });
  } catch (error) {
    return Response.json({ message: error.status ? error.message : "Could not open payment. Please try again." }, { status: error.status || 503, headers: eventTicketPrivacyHeaders });
  }
};
