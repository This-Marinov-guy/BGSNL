import { LEGACY_ARTICLES } from "../defines/ARTICLES";
import { SITE_URL } from "../seo/site";

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

export { SITE_URL };

const PRODUCTION_API_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://api.bulgariansociety.nl/api/"
).replace(/\/+$/, "");

const TEST_API_URL = (
  process.env.NEXT_PUBLIC_TEST_SERVER_URL || "http://127.0.0.1:8080/api/"
).replace(/\/+$/, "");

const API_URL =
  process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : TEST_API_URL;

/**
 * Fail loudly rather than silently shipping the secret below to the browser.
 * Every export here is meant to run only during a server render.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "src/util/api/server.js was imported into a client bundle. It holds the " +
      "server-to-server API key — import it only from server components."
  );
}

/**
 * The API's firewall (BGSNL-API middleware/firewall.js) identifies callers two
 * ways:
 *
 *  - `x-bgsnl-server-key`, a shared secret only this server knows. Server-only
 *    env var, deliberately without the NEXT_PUBLIC_ prefix so Next refuses to
 *    inline it into client bundles. Browsers cannot send it: it is not in the
 *    API's Access-Control-Allow-Headers.
 *  - the browser Origin allow-list, kept here as a fallback so the site keeps
 *    working if the key has not been configured on the API yet. Once both
 *    sides have the key, the key is what actually identifies us.
 */
const SERVER_KEY = process.env.BGSNL_SERVER_KEY || "";

export const API_HEADERS = {
  ...(SERVER_KEY ? { "x-bgsnl-server-key": SERVER_KEY } : {}),
  Origin: SITE_URL,
  Referer: `${SITE_URL}/`,
};

/**
 * Never throws. A page whose data fetch failed should still render its shell
 * (the client effect will retry after hydration), not return a 500.
 */
async function apiGet(
  endpoint,
  { revalidate = 300, timeout = 8000, fallbackToProduction = false } = {}
) {
  const baseUrls = [API_URL];

  if (fallbackToProduction && PRODUCTION_API_URL !== API_URL) {
    baseUrls.push(PRODUCTION_API_URL);
  }

  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(`${baseUrl}/${endpoint}`, {
        headers: API_HEADERS,
        signal: AbortSignal.timeout(timeout),
        next: { revalidate },
      });

      if (res.ok) return await res.json();
    } catch {
      // Try the next configured public API when one is available.
    }
  }

  return null;
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
  const data = await apiGet("wordpress/posts", {
    fallbackToProduction: true,
    timeout: 15000,
  });
  const posts = data?.posts ?? [];
  return [...posts, ...LEGACY_ARTICLES];
}

export async function getArticle(articleId) {
  if (!articleId) return null;
  const data = await apiGet(`wordpress/posts/${articleId}`, {
    fallbackToProduction: true,
    timeout: 15000,
  });

  return data?.data ? { ...data.data, id: String(articleId) } : null;
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
