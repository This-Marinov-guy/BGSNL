import { SITE_URL, getEventDetails } from "../api/server";

/**
 * Server-side metadata for event pages.
 *
 * This replaces the crawler-sniffing branch of the old root middleware.js,
 * which fetched the same endpoint and hand-assembled an OG-only HTML document
 * with a meta-refresh redirect for ~20 hardcoded user agents. Next renders the
 * real page with the real <head> for everyone, so no sniffing is needed.
 */

export { SITE_URL };

const DEFAULT_IMAGE = `${SITE_URL}/assets/images/bg/welcome.png`;

export const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

/**
 * The old middleware wrote `og:type="event"` as raw HTML. Next validates this
 * field against the OpenGraph types it knows and throws "Invalid OpenGraph
 * type: event", which aborts metadata generation for the whole page — the
 * event pages ended up with no tags at all. Anything unsupported falls back to
 * "website"; scrapers key off title/description/image regardless.
 */
const OG_TYPES = new Set(["website", "article", "book", "profile"]);

export function toMetadata({ title, description, image, path, type = "website" }) {
  const ogType = OG_TYPES.has(type) ? type : "website";
  const url = `${SITE_URL}${path}`;
  const resolvedTitle = title || "BGSNL – Your Home Away From Home";
  const resolvedDescription =
    description || "The official website of the Bulgarian Society Netherlands.";
  const resolvedImage = image || DEFAULT_IMAGE;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: "BGSNL",
      type: ogType,
      images: [{ url: resolvedImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
    },
  };
}

export async function buildEventMetadata(eventId, path) {
  const event = await getEventDetails(eventId);

  if (!event) {
    return toMetadata({ path, type: "event" });
  }

  return toMetadata({
    title: event.newTitle || event.title,
    description: stripHtml(event.description || event.text),
    image: event.poster ? `${SITE_URL}${event.poster}` : undefined,
    path,
    type: "event",
  });
}
