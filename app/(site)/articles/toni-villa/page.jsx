import { toMetadata } from "@/util/seo/event-metadata";
import Toni from "@/screens/information/articles/Toni";

export const metadata = toMetadata({
  title: "The entrepreneurship series II: Toni Enchev Small steps towards big goals",
  image: "https://www.bulgariansociety.nl/assets/images/profile/toni/1.webp",
  path: "/articles/toni-villa",
  type: "article",
});

export default function Page() {
  return (
    <Toni />
  );
}
