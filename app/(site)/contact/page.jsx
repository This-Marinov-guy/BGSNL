import Contact from "@/screens/information/Contact";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Contact",
  description:
    "Contact the Bulgarian Society Netherlands or find the local chapter nearest to you.",
  path: "/contact",
});

export default function Page() {
  return (
    <Contact />
  );
}
