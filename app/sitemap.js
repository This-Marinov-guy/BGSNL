import { REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { getArticles, getEvents } from "@/util/api/server";
import { articleSlug } from "@/util/seo/site";

/**
 * Replaces scripts/generate-sitemap.js, which wrote public/sitemap.xml at build
 * time (`npm run build` -> generate-sitemap -> vite build). Generating it on
 * request means new events and articles appear without a redeploy.
 */

const BASE_URL = "https://www.bulgariansociety.nl";

// Re-fetch at most once an hour.
export const revalidate = 3600;

const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/board-and-committee", priority: 0.8, changeFrequency: "monthly" },
  { path: "/welcome-to-alumni", priority: 0.8, changeFrequency: "monthly" },
  { path: "/join-the-society", priority: 0.9, changeFrequency: "monthly" },
  { path: "/hall-of-fame", priority: 0.7, changeFrequency: "monthly" },
  { path: "/developers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/internships", priority: 0.8, changeFrequency: "monthly" },
  { path: "/terms-and-legals", priority: 0.5, changeFrequency: "yearly" },
  { path: "/partners", priority: 0.7, changeFrequency: "monthly" },
  { path: "/partners/pwc-bulgaria", priority: 0.7, changeFrequency: "monthly" },
  { path: "/articles", priority: 0.9, changeFrequency: "weekly" },
  { path: "/articles/toni-villa", priority: 0.7, changeFrequency: "yearly" },
  {
    path: "/articles/from-bulgaria-to-the-netherlands",
    priority: 0.7,
    changeFrequency: "yearly",
  },
  { path: "/articles/acedemie-minerva", priority: 0.7, changeFrequency: "yearly" },
];

const REGIONAL_STATIC_ROUTES = [
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/events/future-events", priority: 0.9, changeFrequency: "daily" },
  { path: "/events/past-events", priority: 0.6, changeFrequency: "weekly" },
];

const toDate = (value) => {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default async function sitemap() {
  const now = new Date();

  const entries = [
    ...STATIC_ROUTES.map((r) => ({
      url: `${BASE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
  ];

  for (const region of REGIONS) {
    entries.push({
      url: `${BASE_URL}/${region}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });

    for (const r of REGIONAL_STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${region}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      });
    }
  }

  const [events, articles] = await Promise.all([getEvents(), getArticles()]);

  for (const event of events) {
    if (!event?.id || !event?.region) continue;
    entries.push({
      url: `${BASE_URL}/${event.region}/event-details/${event.id}`,
      lastModified: toDate(event.updated_at || event.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const article of articles) {
    if (!article?.id || !article?.title || article.legacyLink) continue;
    entries.push({
      url: `${BASE_URL}/articles/${article.id}/${articleSlug(article.title)}`,
      lastModified: toDate(
        article.updated_at || article.created_at || article.date
      ),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
