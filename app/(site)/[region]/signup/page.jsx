import SignUp from "@/screens/authentication/SignUp";
import { toMetadata } from "@/util/seo/event-metadata";

// Ported from the STATIC_META table in the old root middleware.js, which
// matched /^\/(?:[^/]+\/)?signup$/ — i.e. both the bare and region-scoped form.
export async function generateMetadata({ params }) {
  const { region } = await params;

  return toMetadata({
    title: "Become a Member - BGSNL",
    description:
      "Join the Bulgarian Society Netherlands during your academic years. Get event discounts, explore internship options, and get the chance to enter a committee or board.",
    image: "https://www.bulgariansociety.nl/assets/images/alumni/members.jpg",
    path: `/${region}/signup`,
  });
}

export default function Page() {
  return <SignUp />;
}
