import Structure from "@/screens/information/Structure";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Board and Committees",
  description: "Meet the boards and committees running the Bulgarian Society Netherlands across all of our regions.",
  path: "/board-and-committee",
});

export default function Page() {
  return (
    <Structure />
  );
}
