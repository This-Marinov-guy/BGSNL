import { PastEvents } from "@/screens/information/PastEvents";
import { humanizeRegion, toMetadata } from "@/util/seo/site";

export async function generateMetadata({ params }) {
  const { region } = await params;
  const regionName = humanizeRegion(region);

  return toMetadata({
    title: `Past BGSNL Events in ${regionName}`,
    description: `Explore past Bulgarian cultural, social and community events in ${regionName}.`,
    path: `/${region}/events/past-events`,
  });
}

export default function Page() {
  return (
    <PastEvents />
  );
}
