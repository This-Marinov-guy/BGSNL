import About from "@/screens/information/About";
import { getAboutData } from "@/util/api/server";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "About Us",
  description:
    "Learn about the Bulgarian Society Netherlands — who we are, what we do, and how we bring Bulgarians in the Netherlands together.",
  path: "/about",
});

export default async function Page() {
  const initialAboutData = await getAboutData();

  return <About initialAboutData={initialAboutData ?? {}} />;
}
