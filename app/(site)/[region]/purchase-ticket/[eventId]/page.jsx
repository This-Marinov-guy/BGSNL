import PurchaseTicket from "@/screens/eventActions/PurchaseTicket";
import { buildEventMetadata } from "@/util/seo/event-metadata";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  return buildEventMetadata(eventId, `/${region}/purchase-ticket/${eventId}`);
}

export default function Page() {
  return <PurchaseTicket />;
}
