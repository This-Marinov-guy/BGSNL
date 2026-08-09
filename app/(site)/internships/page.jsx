import { toMetadata } from "@/util/seo/event-metadata";
import { getInternships } from "@/util/api/server";
import Internships from "@/screens/information/Internships";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";

export const metadata = toMetadata({
  title: "Internships - BGSNL Community",
  description:
    "Browse internships and career opportunities shared with the Bulgarian Society Netherlands community.",
  image: "https://www.bulgariansociety.nl/assets/images/news/internships.jpg",
  path: "/internships",
  type: "website",
});

export default async function Page() {
  const internships = await getInternships();

  return <Internships initialInternships={internships} />;
}
