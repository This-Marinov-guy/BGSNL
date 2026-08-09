import { toMetadata } from "@/util/seo/event-metadata";
import Minerva from "@/screens/information/articles/Minerva";

export const metadata = toMetadata({
  title: "Bulgarian student exhibitions in Groningen",
  image: "https://www.bulgariansociety.nl/assets/images/profile/minerva/1.webp",
  path: "/articles/acedemie-minerva",
  type: "article",
});

export default function Page() {
  return (
    <Minerva />
  );
}
