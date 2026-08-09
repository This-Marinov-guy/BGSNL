import AlumniSignUp from "@/screens/alumni/AlumniSignUp";
import { toMetadata } from "@/util/seo/event-metadata";

// Ported from the STATIC_META table in the old root middleware.js.
export const metadata = toMetadata({
  title: "Become an Alumni - BGSNL",
  description:
    "Support the Bulgarian Society Netherlands as a post-graduate alumni. Network with the community, attend alumni events, and aid our mission.",
  image: "https://www.bulgariansociety.nl/assets/images/alumni/alumni.jpeg",
  path: "/alumni/register",
});

export default function Page() {
  return <AlumniSignUp />;
}
