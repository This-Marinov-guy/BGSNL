import { SHARE_IMAGE_SIZE } from "@/util/seo/ShareImage";
import { renderEventShareImage } from "@/util/seo/render-share-image";

export const alt = "BGSNL event";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function Image({ params }) {
  const { eventId, region } = await params;
  return renderEventShareImage(eventId, region);
}
