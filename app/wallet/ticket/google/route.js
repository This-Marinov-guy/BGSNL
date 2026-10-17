import { readEventTicket, ticketWalletHeaders, validTicketWalletQuery } from "@/util/wallet/event-ticket-server";
import { createGoogleEventTicketUrl } from "@/util/wallet/event-ticket.mjs";
import { walletReadiness } from "@/util/wallet/issuance.mjs";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const failure = (request, code) => {
  const destination = new URL("/wallet/ticket", request.url);
  for (const [name, value] of new URL(request.url).searchParams) destination.searchParams.set(name, value);
  destination.searchParams.set("walletError", code);
  return new Response(null, { status: 303, headers: { ...ticketWalletHeaders, Location: destination.href } });
};
export async function GET(request) {
  const identity = Object.fromEntries(new URL(request.url).searchParams);
  if (!validTicketWalletQuery(identity)) notFound();
  let packet;
  try { packet = await readEventTicket(identity); }
  catch { return failure(request, "prepare"); }
  if (!packet) notFound();
  try {
    if (!(await walletReadiness()).google.available) return failure(request, "provider");
    const response = Response.redirect(await createGoogleEventTicketUrl(packet), 303);
    for (const [name, value] of Object.entries(ticketWalletHeaders)) response.headers.set(name, value);
    return response;
  } catch { return failure(request, "prepare"); }
}
