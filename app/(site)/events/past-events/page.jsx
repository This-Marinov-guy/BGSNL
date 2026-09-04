import { PastEvents } from "@/screens/information/PastEvents";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Past Events",
  description: "A look back at events by the Bulgarian Society Netherlands.",
  path: "/events/past-events",
});

export default function Page() {
  return (
    <PastEvents />
  );
}
