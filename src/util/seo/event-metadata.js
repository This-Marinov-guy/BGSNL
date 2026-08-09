/**
 * Server-side metadata for event pages.
 *
 * This replaces the crawler-sniffing branch of the old root middleware.js,
 * which fetched the same endpoint and hand-assembled an OG-only HTML document
 * with a meta-refresh redirect for ~20 hardcoded user agents. Next renders the
 * real page with the real <head> for everyone, so no sniffing is needed.
 */

export const SITE_URL = "https://www.bulgariansociety.nl";

const API_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL || "https://api.bulgariansociety.nl/api/"
).replace(/\/+$/, "");

const DEFAULT_IMAGE = `${SITE_URL}/assets/images/bg/welcome.png`;

/**
 * The API rejects server-to-server calls that arrive without a site Origin
 * ("Forbidden: Access is denied!"), which browsers send automatically but
 * fetch() on the server does not. Without these the metadata below would
 * silently fall back to site defaults on every event page.
 */
export const API_HEADERS = {
  Origin: SITE_URL,
  Referer: `${SITE_URL}/`,
};

export const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

export async function fetchEvent(eventId) {
  if (!eventId) return null;

  try {
    const res = await fetch(`${API_URL}/event/event-details/${eventId}`, {
      headers: API_HEADERS,
      // Matches the old middleware's 3s budget; a slow API must not block SSR.
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.event ?? null;
  } catch {
    // API unreachable or timed out — fall back to the site-level defaults.
    return null;
  }
}

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
  const event = await fetchEvent(eventId);

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
