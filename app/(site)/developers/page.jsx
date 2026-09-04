import Developers from "@/screens/information/Developers";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Developers",
  description: "The developers behind the Bulgarian Society Netherlands platform.",
  path: "/developers",
});

export default function Page() {
  return (
    <Developers />
  );
}
