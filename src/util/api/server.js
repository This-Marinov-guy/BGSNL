import { cache } from "react";
import { LEGACY_ARTICLES } from "../defines/ARTICLES";
import { SITE_URL } from "../seo/site";
import { versionedApiBase } from "./versioned-base.mjs";
import { createPublicReader } from "./public-reader.mjs";

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
  versionedApiBase(process.env.NEXT_PUBLIC_SERVER_URL || "https://api.bulgariansociety.nl/api/")
);

const TEST_API_URL = (
  versionedApiBase(process.env.NEXT_PUBLIC_TEST_SERVER_URL || "http://127.0.0.1:8080/api/")
);

export const API_URL =
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
 * Production SSR requires this key. Origin can be forged outside a browser;
 * it is CORS admission, not server-to-server authentication.
 */
const SERVER_KEY = process.env.BGSNL_SERVER_KEY || "";

export const API_HEADERS = {
  ...(SERVER_KEY ? { "x-bgsnl-server-key": SERVER_KEY } : {}),
  Origin: SITE_URL,
  Referer: `${SITE_URL}/`,
};

// Keep Next's successful fetch cache, but let uncached public pages render
// their static content during an outage. Never send an unauthenticated request
// when the production server key is missing. Private/payment reads are separate.
const apiGet = createPublicReader({
  baseUrls: [API_URL],
  headers: API_HEADERS,
  enabled: process.env.NODE_ENV !== "production" || SERVER_KEY.length >= 32,
  report: ({ endpoint, reason }) => console.warn(`[public-content] ${endpoint}: ${reason}`),
});

/* ---------------------------------------------------------------- events -- */

export async function getEvents() {
  const data = await apiGet("event/events-list", { tags: ["public-events"] });
  return Array.isArray(data?.events) ? data.events : [];
}

/**
 * Grouped by region, mirroring the shape the `events` Redux slice builds, so a
 * screen can swap between the server value and the store without branching.
 */
export async function getEventsByRegion(regions) {
  const data = await apiGet("event/events-list", { tags: ["public-events"] });
  if (!Array.isArray(data?.events)) return null;
  const events = data.events;

  const grouped = regions.reduce((acc, region) => {
    acc[region] = [];
    return acc;
  }, {});

  for (const event of events) {
    if (grouped[event.region]) grouped[event.region].push(event);
  }

  return grouped;
}

// Share the lookup between metadata and page rendering within each request.
export const getEventDetails = cache(async (eventId, region) => {
  if (!eventId) return null;
  // Shorter budget: this one blocks metadata generation.
  const data = await apiGet(`event/event-details/${encodeURIComponent(eventId)}${region ? `?region=${encodeURIComponent(region)}` : ""}`, {
    timeout: 3000,
    tags: ["public-events", `public-event:${eventId}`],
  });
  return data === undefined ? undefined : data?.event ?? null;
});

/* -------------------------------------------------------------- articles -- */

/**
 * Appends LEGACY_ARTICLES exactly like the `loadArticles` reducer does, so the
 * server render and the post-hydration Redux render produce the same list.
 */
export async function getArticles() {
  const data = await apiGet("wordpress/posts");
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  return [...posts, ...LEGACY_ARTICLES];
}

export const getArticle = cache(async (articleId) => {
  if (!articleId) return null;
  const data = await apiGet(`wordpress/posts/${encodeURIComponent(articleId)}`);

  if (data === undefined) return undefined;
  return data?.data ? { ...data.data, id: String(articleId) } : null;
});

/* ----------------------------------------------------------- internships -- */

export async function getInternships() {
  const data = await apiGet("internship/list");
  return Array.isArray(data?.internships) ? data.internships : null;
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
  return Array.isArray(data?.nodes) ? data.nodes : [];
}
