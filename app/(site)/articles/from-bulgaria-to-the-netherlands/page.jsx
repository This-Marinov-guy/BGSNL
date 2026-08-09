import { toMetadata } from "@/util/seo/event-metadata";
import StudentMigration from "@/screens/information/articles/StudentMigration";

export const metadata = toMetadata({
  title: "From Bulgaria to the Netherlands",
  image: "https://www.bulgariansociety.nl/assets/images/profile/from-bg-to-nl/1.webp",
  path: "/articles/from-bulgaria-to-the-netherlands",
  type: "article",
});

export default function Page() {
  return (
    <StudentMigration />
  );
}
