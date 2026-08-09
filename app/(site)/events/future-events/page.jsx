import { FutureEvents } from "@/screens/information/FutureEvents";
import { getEventsByRegion } from "@/util/api/server";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

export const metadata = {
  title: "Future Events",
  description: "Upcoming events organised by the Bulgarian Society Netherlands.",
};

export default async function Page() {
  const initialEvents = await getEventsByRegion(REGIONS);

  return <FutureEvents initialEvents={initialEvents} />;
}
