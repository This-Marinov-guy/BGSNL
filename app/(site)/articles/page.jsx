import { toMetadata } from "@/util/seo/event-metadata";
import ArticlesPage from "@/screens/information/articles/ArticlesPage";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";


export const metadata = toMetadata({
  title: "Articles",
  description: "News, stories and articles from the Bulgarian Society Netherlands community.",
  image: "https://www.bulgariansociety.nl/assets/images/avatars/article.png",
  path: "/articles",
  type: "website",
});

export default function Page() {
  return (
    <ArticlesPage />
  );
}
