import HallOfFame from "@/screens/information/HallOfFame";
import { getAlumniTree } from "@/util/api/server";

export const metadata = {
  title: "Hall of Fame",
  description:
    "Celebrating the people who shaped the Bulgarian Society Netherlands over the years.",
};

export default async function Page() {
  const nodes = await getAlumniTree();

  return <HallOfFame initialNodes={nodes} />;
}
