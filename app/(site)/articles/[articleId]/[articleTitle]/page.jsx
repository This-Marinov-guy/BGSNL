import Article from "@/screens/information/articles/Article";
import { getArticle, getArticles } from "@/util/api/server";
import { stripHtml, toMetadata } from "@/util/seo/event-metadata";

export async function generateMetadata({ params }) {
  const { articleId, articleTitle } = await params;
  const path = `/articles/${articleId}/${articleTitle}`;

  // The single-post endpoint returns only { title, content, translations },
  // with no image — the thumbnail only exists on the list endpoint, so the
  // share image is looked up there (both responses are fetch-cached).
  const [article, all] = await Promise.all([getArticle(articleId), getArticles()]);

  if (!article) return toMetadata({ path, type: "article" });

  const listed = all.find((a) => String(a.id) === String(articleId));

  return toMetadata({
    title: article.title,
    description:
      article.excerpt || article.description || stripHtml(article.content),
    image: listed?.thumbnail,
    path,
    type: "article",
  });
}

export default async function Page({ params }) {
  const { articleId } = await params;
  const article = await getArticle(articleId);

  return <Article initialArticle={article} />;
}
