import { ImageResponse } from "next/og";
import { getArticle, getArticles, getEventDetails } from "@/util/api/server";
import ShareImage, { SHARE_IMAGE_SIZE } from "./ShareImage";
import { loadShareImage } from "./share-image-media";
import { humanizeRegion, truncateText } from "./site";

export async function renderArticleShareImage(articleId) {
  const [article, articles] = await Promise.all([getArticle(articleId), getArticles()]);
  const listed = articles.find((item) => String(item.id) === String(articleId));
  const contentImage = article?.content?.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  const thumbnail = listed?.thumbnail || article?.thumbnail || article?.featured_image || article?.image || article?.cover_photo || contentImage;
  const imageSrc = await loadShareImage(thumbnail);

  return new ImageResponse(
    <ShareImage
      eyebrow="BGSNL Article"
      title={article?.title || "Bulgarian Society Netherlands"}
      description={truncateText(article?.excerpt || article?.description || article?.content, 120)}
      imageSrc={imageSrc}
      imageFit="cover"
    />,
    SHARE_IMAGE_SIZE
  );
}

export async function renderEventShareImage(eventId, region) {
  const event = await getEventDetails(eventId, region);
  const imageSrc = await loadShareImage(event?.poster);

  return new ImageResponse(
    <ShareImage
      eyebrow={`BGSNL ${humanizeRegion(region)} Event`}
      title={event?.newTitle || event?.title || "BGSNL Event"}
      description={truncateText(event?.description || event?.text, 120)}
      imageSrc={imageSrc}
      imageFit="contain"
    />,
    SHARE_IMAGE_SIZE
  );
}
