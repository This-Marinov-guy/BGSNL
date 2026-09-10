import { ImageResponse } from "next/og";
import { getArticle } from "@/util/api/server";
import ShareImage, { SHARE_IMAGE_SIZE } from "@/util/seo/ShareImage";
import { truncateText } from "@/util/seo/site";

export const alt = "BGSNL article";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function Image({ params }) {
  const { articleId } = await params;
  const article = await getArticle(articleId);

  return new ImageResponse(
    (
      <ShareImage
        eyebrow="BGSNL Article"
        title={article?.title || "Bulgarian Society Netherlands"}
        description={truncateText(
          article?.excerpt || article?.description || article?.content,
          120
        )}
      />
    ),
    size
  );
}
