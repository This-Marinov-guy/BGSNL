import PropTypes from "prop-types";
import { eventTicketRequest } from "@/util/payments/event-ticket-server";
import EmailTicketPreferences from "@/screens/eventActions/EmailTicketPreferences";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ticket preferences", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function TicketPreferencesPage({ params }) {
  const { checkout } = await params;
  let details;
  try { details = await eventTicketRequest(checkout); }
  catch (error) {
    return <main className="container py--80" data-private data-hj-suppress><h1>Ticket checkout unavailable</h1><p>{error.message}</p><a href="/events/future-events" className="rn-button-style--2 rn-btn-green">View events</a></main>;
  }
  return <EmailTicketPreferences checkout={checkout} details={details} />;
}

TicketPreferencesPage.propTypes = { params: PropTypes.object.isRequired };
