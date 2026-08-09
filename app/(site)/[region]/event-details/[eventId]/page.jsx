import EventDetails from "@/screens/eventActions/EventDetails";
import { buildEventMetadata } from "@/util/seo/event-metadata";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  return buildEventMetadata(eventId, `/${region}/event-details/${eventId}`);
}

export default function Page() {
  return <EventDetails />;
}
