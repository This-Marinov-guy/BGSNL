import { readEventTicket, validTicketWalletQuery } from "@/util/wallet/event-ticket-server";
import EventTicketWallet from "@/screens/eventActions/EventTicketWallet";
import PropTypes from "prop-types";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Add event ticket to Wallet", robots: { index: false, follow: false, noarchive: true, nosnippet: true }, referrer: "no-referrer", alternates: { canonical: null } };

export default async function Page({ searchParams }) {
  const identity = await searchParams;
  if (!validTicketWalletQuery(identity)) notFound();
  let packet;
  try { packet = await readEventTicket(identity); }
  catch { return <EventTicketWallet state="error" />; }
  if (!packet) notFound();
  return <EventTicketWallet state="ready" packet={packet} issueError={identity.walletError}
    autoDownloadPass={identity.autoDownloadPass === "true"} />;
}

Page.propTypes = { searchParams: PropTypes.object };
