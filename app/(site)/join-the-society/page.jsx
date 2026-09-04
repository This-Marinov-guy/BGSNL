import JoinTheSociety from "@/screens/information/JoinTheSociety";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Join the Society",
  description: "Become a member of the Bulgarian Society Netherlands: event discounts, internships, committees and a community away from home.",
  path: "/join-the-society",
});

export default function Page() {
  return (
    <JoinTheSociety />
  );
}
