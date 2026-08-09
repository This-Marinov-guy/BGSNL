import PwcPartner from "@/screens/information/PwcPartner";
import { toMetadata } from "@/util/seo/event-metadata";

// Ported from the STATIC_META table in the old root middleware.js.
export const metadata = toMetadata({
  title: "PwC Bulgaria x BGSNL",
  description:
    "Explore PwC Bulgaria's partnership with Bulgarian Society Netherlands, including career opportunities, company insights, and active internships shared with our community.",
  image: "https://www.bulgariansociety.nl/assets/images/events/pwc.jpeg",
  path: "/partners/pwc-bulgaria",
});

export default function Page() {
  return <PwcPartner />;
}
