import Home from "@/screens/Home";
import { getEventsByRegion } from "@/util/api/server";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

// Public event data is live content: render on request instead of making a
// deploy depend on the API being reachable during static generation.
export const dynamic = "force-dynamic";

export default async function Page() {
  const initialEvents = await getEventsByRegion(REGIONS);

  return <Home initialEvents={initialEvents} />;
}
