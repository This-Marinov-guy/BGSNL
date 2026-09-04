import Partners from "@/screens/information/Partners";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Partners",
  description: "The organisations and companies partnering with the Bulgarian Society Netherlands.",
  path: "/partners",
});

export default function Page() {
  return (
    <Partners />
  );
}
