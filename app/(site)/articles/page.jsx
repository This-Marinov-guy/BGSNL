import { toMetadata } from "@/util/seo/event-metadata";
import { getArticles } from "@/util/api/server";
import ArticlesPage from "@/screens/information/articles/ArticlesPage";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";

export const metadata = toMetadata({
  title: "Articles",
  description:
    "News, stories and articles from the Bulgarian Society Netherlands community.",
  image: "https://www.bulgariansociety.nl/assets/images/avatars/article.png",
  path: "/articles",
  type: "website",
});

export default async function Page() {
  const articles = await getArticles();

  return <ArticlesPage initialArticles={articles} />;
}
