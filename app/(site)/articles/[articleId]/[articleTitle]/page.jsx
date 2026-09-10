/* eslint-disable react/prop-types */
import Article from "@/screens/information/articles/Article";
import { getArticle, getArticles } from "@/util/api/server";
import { notFound, permanentRedirect } from "next/navigation";
import { articleSlug, stripHtml, toMetadata } from "@/util/seo/site";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  serializeJsonLd,
} from "@/util/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { articleId, articleTitle } = await params;
  const article = await getArticle(articleId);

  if (article) {
    const canonicalSlug = articleSlug(article.title);
    if (articleTitle !== canonicalSlug) {
      permanentRedirect(`/articles/${articleId}/${canonicalSlug}`);
    }
  }

  const path = `/articles/${articleId}/${
    article ? articleSlug(article.title) : articleTitle
  }`;

  if (!article) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return toMetadata({
    title: article.title,
    description:
      article.excerpt || article.description || stripHtml(article.content),
    imageAlt: `${article.title} — BGSNL article`,
    path,
    type: "article",
    useGeneratedImage: true,
  });
}

export default async function Page({ params }) {
  const { articleId, articleTitle } = await params;
  const [article, all] = await Promise.all([getArticle(articleId), getArticles()]);

  if (!article) notFound();

  const canonicalSlug = articleSlug(article.title);
  if (articleTitle !== canonicalSlug) {
    permanentRedirect(`/articles/${articleId}/${canonicalSlug}`);
  }

  const path = `/articles/${articleId}/${articleTitle}`;
  const listed = all.find((item) => String(item.id) === String(articleId));
  const articleSchema = buildArticleSchema({
    article: { ...listed, ...article, id: articleId },
    image: listed?.thumbnail,
    path,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: article.title, path },
  ]);

  return (
    <>
      {articleSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <Article
        initialArticle={
          listed?.thumbnail
            ? { ...article, thumbnail: listed.thumbnail }
            : article
        }
      />
    </>
  );
}
