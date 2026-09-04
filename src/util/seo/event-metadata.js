import { getEventDetails } from "../api/server";
import {
  SITE_URL,
  absoluteUrl,
  stripHtml,
  toMetadata,
  truncateText,
} from "./site";

/**
 * Server-side metadata for event pages.
 *
 * This replaces the crawler-sniffing branch of the old root middleware.js,
 * which fetched the same endpoint and hand-assembled an OG-only HTML document
 * with a meta-refresh redirect for ~20 hardcoded user agents. Next renders the
 * real page with the real <head> for everyone, so no sniffing is needed.
 */

export { SITE_URL, absoluteUrl, stripHtml, toMetadata, truncateText };

export async function buildEventMetadata(eventId, path) {
  const event = await getEventDetails(eventId);

  if (!event) {
    return toMetadata({ path, type: "event" });
  }

  return toMetadata({
    title: event.newTitle || event.title,
    description: truncateText(event.description || event.text),
    imageAlt: `${event.newTitle || event.title} — BGSNL event`,
    path,
    type: "event",
    useGeneratedImage: true,
  });
}
