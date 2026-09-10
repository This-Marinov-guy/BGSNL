import { ImageResponse } from "next/og";
import { getEventDetails } from "@/util/api/server";
import ShareImage, { SHARE_IMAGE_SIZE } from "@/util/seo/ShareImage";
import { humanizeRegion, truncateText } from "@/util/seo/site";

export const alt = "BGSNL event";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function Image({ params }) {
  const { eventId, region } = await params;
  const event = await getEventDetails(eventId);

  return new ImageResponse(
    (
      <ShareImage
        eyebrow={`BGSNL ${humanizeRegion(region)} Event`}
        title={event?.newTitle || event?.title || "BGSNL Event"}
        description={truncateText(event?.description || event?.text, 120)}
      />
    ),
    size
  );
}
