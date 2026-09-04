import HallOfFame from "@/screens/information/HallOfFame";
import { getAlumniTree } from "@/util/api/server";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Hall of Fame",
  description:
    "Celebrating the people who shaped the Bulgarian Society Netherlands over the years.",
  path: "/hall-of-fame",
});

export default async function Page() {
  const nodes = await getAlumniTree();

  return <HallOfFame initialNodes={nodes} />;
}
