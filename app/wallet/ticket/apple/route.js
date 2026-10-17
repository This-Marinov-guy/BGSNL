import { readEventTicket, ticketWalletHeaders, validTicketWalletQuery } from "@/util/wallet/event-ticket-server";
import { createAppleEventTicket } from "@/util/wallet/event-ticket.mjs";
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
    if (!(await walletReadiness()).apple.available) return failure(request, "provider");
    const pass = await createAppleEventTicket(packet);
    return new Response(new Uint8Array(pass), { headers: { ...ticketWalletHeaders, "Content-Type": "application/vnd.apple.pkpass", "Content-Disposition": 'attachment; filename="bgsnl-event-ticket.pkpass"' } });
  } catch { return failure(request, "prepare"); }
}
