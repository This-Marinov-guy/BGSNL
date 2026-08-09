import { LEGACY_ARTICLES } from "../defines/ARTICLES";

/**
 * Server-side API client.
 *
 * Public pages fetch their data here, during the server render, so the HTML
 * that leaves the server already contains events, articles and internships
 * instead of an empty list waiting on a client effect.
 *
 * Deliberately plain `fetch` rather than the app's useHttpClient: that hook is
 * built on Redux (loading state, notifications, JWT refresh) and is only
 * meaningful in the browser. Account pages keep using it.
 */

export const SITE_URL = "https://www.bulgariansociety.nl";

const API_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL || "https://api.bulgariansociety.nl/api/"
).replace(/\/+$/, "");

/**
 * The API answers "Forbidden: Access is denied!" to requests without a site
 * Origin. Browsers attach it automatically; server-side fetch does not.
 */
export const API_HEADERS = {
  Origin: SITE_URL,
  Referer: `${SITE_URL}/`,
};

/**
 * Never throws. A page whose data fetch failed should still render its shell
 * (the client effect will retry after hydration), not return a 500.
 */
async function apiGet(endpoint, { revalidate = 300, timeout = 8000 } = {}) {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      headers: API_HEADERS,
      signal: AbortSignal.timeout(timeout),
      next: { revalidate },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- events -- */

export async function getEvents() {
  const data = await apiGet("event/events-list");
  return data?.events ?? [];
}

/**
 * Grouped by region, mirroring the shape the `events` Redux slice builds, so a
 * screen can swap between the server value and the store without branching.
 */
export async function getEventsByRegion(regions) {
  const events = await getEvents();

  const grouped = regions.reduce((acc, region) => {
    acc[region] = [];
    return acc;
  }, {});

  for (const event of events) {
    if (grouped[event.region]) grouped[event.region].push(event);
  }

  return grouped;
}

export async function getEventDetails(eventId) {
  if (!eventId) return null;
  // Shorter budget: this one blocks metadata generation.
  const data = await apiGet(`event/event-details/${eventId}`, { timeout: 3000 });
  return data?.event ?? null;
}

/* -------------------------------------------------------------- articles -- */

/**
 * Appends LEGACY_ARTICLES exactly like the `loadArticles` reducer does, so the
 * server render and the post-hydration Redux render produce the same list.
 */
export async function getArticles() {
  const data = await apiGet("wordpress/posts");
  const posts = data?.posts ?? [];
  return [...posts, ...LEGACY_ARTICLES];
}

export async function getArticle(articleId) {
  if (!articleId) return null;
  const data = await apiGet(`wordpress/posts/${articleId}`);
  return data?.data ?? null;
}

/* ----------------------------------------------------------- internships -- */

export async function getInternships() {
  const data = await apiGet("internship/list");
  return data?.internships ?? [];
}

/* ---------------------------------------------------------------- common -- */

export async function getAboutData() {
  return apiGet("common/get-about-data");
}

export async function getMemberCount() {
  const data = await apiGet("common/get-member-count");
  return data?.count ?? null;
}

export async function getActiveMemberCount() {
  const data = await apiGet("common/get-active-member-count");
  return data?.count ?? null;
}

export async function getAlumniTree() {
  const data = await apiGet("user/tree-layout");
  return data?.nodes ?? [];
}
