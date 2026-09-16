import "server-only";
import { cookies } from "next/headers";
import { API_HEADERS, API_URL } from "@/util/api/server";
import { eventTicketCookieName, validEventTicketToken } from "./event-ticket-policy.mjs";

export async function eventTicketRequest(checkout, action = "preferences", choices = {}) {
  const name = eventTicketCookieName(checkout);
  const token = name ? (await cookies()).get(name)?.value : null;
  if (!validEventTicketToken(token)) throw Object.assign(new Error("This checkout link has expired. Please reopen the Get ticket link in your email."), { status: 410 });
  if (!["preferences", "checkout"].includes(action)) throw new Error("Invalid ticket action");
  let response;
  try {
    response = await fetch(`${API_URL}/payment/event-ticket/${action}`, {
      method: "POST", headers: { ...API_HEADERS, "Content-Type": "application/json" },
      // No account/session cookies or authorization header are forwarded.
      body: JSON.stringify({ token, addOns: choices.addOns, preferences: choices.preferences, revision: choices.revision }),
      cache: "no-store", signal: AbortSignal.timeout(action === "checkout" ? 60000 : 20000),
    });
  } catch { throw Object.assign(new Error("We could not reach checkout. Please try again shortly."), { status: 503 }); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(response.status < 500 ? result.message || "This ticket link is no longer available." : "Checkout is temporarily unavailable. Please try again shortly."), { status: response.status });
  return result;
}
