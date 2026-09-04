import Policy from "@/screens/information/Policy";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Terms and Legals",
  description: "Terms of service, privacy policy and legal information for the Bulgarian Society Netherlands.",
  path: "/terms-and-legals",
});

export default function Page() {
  return (
    <Policy />
  );
}
