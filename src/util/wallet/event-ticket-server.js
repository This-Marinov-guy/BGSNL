import "server-only";
import { API_URL, API_HEADERS } from "@/util/api/server";
import { isEventTicketExpired, validateEventTicket } from "./event-ticket.mjs";
import { ticketLookupSucceeded } from "./event-ticket-lookup.mjs";

export const ticketWalletHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export const validTicketWalletQuery = ({ event, ticket, key }) => /^[a-f\d]{24}$/i.test(event || "") && /^[a-f\d]{24}$/i.test(ticket || "") && /^[A-Za-z0-9_-]{22}$/.test(key || "");

export async function readEventTicket(identity) {
  if (!validTicketWalletQuery(identity)) return null;
  if (!process.env.BGSNL_SERVER_KEY) throw new Error("Ticket Wallet service unavailable");
  const response = await fetch(`${API_URL}/event/wallet/details`, {
    method: "POST", headers: { ...API_HEADERS, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ eventId: identity.event, ticketId: identity.ticket, token: identity.key }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
  });
  if (!await ticketLookupSucceeded(response)) return null;
  const packet = validateEventTicket(await response.json());
  return isEventTicketExpired(packet.event.date) ? null : packet;
}
