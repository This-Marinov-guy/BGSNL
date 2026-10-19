import { notFound } from "next/navigation";
import EventTicketWallet from "@/screens/eventActions/EventTicketWallet";
import PropTypes from "prop-types";

export const metadata = { title: "Ticket Wallet preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const packet = {
  event: {
    id: "507f1f77bcf86cd799439011",
    title: "Community dinner",
    date: "2026-10-20T17:00:00Z",
    location: "Groningen",
    region: "groningen",
    poster: "/assets/wallet-cards/preview-event-poster.jpg",
  },
  ticket: { id: "507f1f77bcf86cd799439012", name: "Alex", quantity: 1,
    image: "/assets/wallet-cards/preview-event-ticket.svg" },
};

export default async function TicketWalletPreviewPage({ searchParams }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { device, autoDownloadPass } = await searchParams;
  const previewProvider = ["apple", "google"].includes(device) ? device : null;

  return <EventTicketWallet state="ready" packet={packet}
    preview previewProvider={previewProvider} autoDownloadPass={autoDownloadPass === "true"} />;
}

TicketWalletPreviewPage.propTypes = { searchParams: PropTypes.object };
