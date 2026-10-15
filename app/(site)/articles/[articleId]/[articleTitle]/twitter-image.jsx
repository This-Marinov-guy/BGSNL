import { SHARE_IMAGE_SIZE } from "@/util/seo/ShareImage";
import { renderArticleShareImage } from "@/util/seo/render-share-image";

export const alt = "BGSNL article";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function Image({ params }) {
  const { articleId } = await params;
  return renderArticleShareImage(articleId);
}
