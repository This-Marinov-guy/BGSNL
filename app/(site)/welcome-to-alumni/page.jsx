import AlumniInfoPage from "@/screens/alumni/AlumniInfoPage";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Welcome to Alumni",
  description: "Stay part of the Bulgarian Society Netherlands after graduation. Discover what our alumni network offers.",
  path: "/welcome-to-alumni",
});

export default function Page() {
  return (
    <AlumniInfoPage />
  );
}
