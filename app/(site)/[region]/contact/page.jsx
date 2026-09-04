import Contact from "@/screens/information/Contact";
import { humanizeRegion, toMetadata } from "@/util/seo/site";

export async function generateMetadata({ params }) {
  const { region } = await params;
  const regionName = humanizeRegion(region);

  return toMetadata({
    title: `Contact BGSNL ${regionName}`,
    description: `Contact the Bulgarian Society ${regionName} chapter and connect with the local Bulgarian community.`,
    path: `/${region}/contact`,
  });
}

export default function Page() {
  return (
    <Contact />
  );
}
