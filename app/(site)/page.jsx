import Home from "@/screens/Home";
import { getEventsByRegion } from "@/util/api/server";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

export default async function Page() {
  const initialEvents = await getEventsByRegion(REGIONS);

  return <Home initialEvents={initialEvents} />;
}
