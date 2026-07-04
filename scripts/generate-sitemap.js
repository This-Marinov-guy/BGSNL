const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { SITEMAP_ROUTES } = require("./seo-page-data");
const pastEventsArchive = require("../src/util/defines/past-events-archive.json");

const BASE_URL = "https://www.bulgariansociety.nl";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://kanatitsa.bulgariansociety.nl/api/";
const SITEMAP_REQUEST_HEADERS = { Origin: BASE_URL };

function encodeForURL(title) {
  if (!title) return "article";
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDate(date) {
  if (!date) return new Date().toISOString();
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function addUniqueUrl(urls, seen, url) {
  if (!url.loc || seen.has(url.loc)) return false;
  urls.push(url);
  seen.add(url.loc);
  return true;
}

async function fetchEvents() {
  try {
    console.log("Fetching events from:", `${SERVER_URL}event/events-list`);
    const response = await axios.get(`${SERVER_URL}event/events-list`, {
      timeout: 10000,
      headers: SITEMAP_REQUEST_HEADERS,
    });

    if (response.data?.events) {
      console.log(`Fetched ${response.data.events.length} API event route candidate(s)`);
      return response.data.events;
    }

    console.warn("No events found in API response");
    return [];
  } catch (error) {
    console.warn("Event API unavailable for sitemap:", error.message);
    return [];
  }
}

async function fetchArticles() {
  try {
    console.log("Fetching articles from:", `${SERVER_URL}wordpress/posts`);
    const response = await axios.get(`${SERVER_URL}wordpress/posts`, {
      timeout: 10000,
      headers: SITEMAP_REQUEST_HEADERS,
    });

    if (response.data?.posts) {
      console.log(`Fetched ${response.data.posts.length} API article route candidate(s)`);
      return response.data.posts;
    }

    console.warn("No articles found in API response");
    return [];
  } catch (error) {
    console.warn("Article API unavailable for sitemap:", error.message);
    return [];
  }
}

function archiveEvents() {
  void pastEventsArchive;
  return [];
}

function routeForApiEvent(event) {
  const id = event.id || event._id;
  const region = event.region;
  if (!id || !region) return null;

  return {
    loc: `${BASE_URL}/${region}/event-details/${id}`,
    lastmod: formatDate(event.updated_at || event.updatedAt || event.created_at || event.createdAt),
    changefreq: "weekly",
    priority: "0.8",
  };
}

function routeForApiArticle(article) {
  if (!article.id || !article.title) return null;
  return {
    loc: `${BASE_URL}/articles/${article.id}/${encodeForURL(article.title)}`,
    lastmod: formatDate(article.updated_at || article.updatedAt || article.created_at || article.createdAt || article.date),
    changefreq: "monthly",
    priority: "0.7",
  };
}

function generateSitemapXML(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

async function generateSitemap() {
  console.log("\nStarting sitemap generation...\n");

  const urls = [];
  const seen = new Set();
  const today = new Date().toISOString();

  console.log("Adding public route inventory...");
  for (const route of SITEMAP_ROUTES) {
    addUniqueUrl(urls, seen, {
      loc: `${BASE_URL}${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }
  console.log(`Added ${SITEMAP_ROUTES.length} public routes\n`);

  console.log("Fetching and adding event routes...");
  const events = await fetchEvents();
  let apiEventRoutes = 0;
  for (const event of events) {
    const route = routeForApiEvent(event);
    if (route && addUniqueUrl(urls, seen, route)) apiEventRoutes += 1;
  }

  let archiveEventRoutes = 0;
  for (const route of archiveEvents()) {
    if (addUniqueUrl(urls, seen, route)) archiveEventRoutes += 1;
  }
  console.log(`Added ${apiEventRoutes} API event route(s)`);
  console.log(`Added ${archiveEventRoutes} archive event route(s)\n`);

  console.log("Fetching and adding article routes...");
  const articles = await fetchArticles();
  let articleRoutes = 0;
  for (const article of articles) {
    const route = routeForApiArticle(article);
    if (route && addUniqueUrl(urls, seen, route)) articleRoutes += 1;
  }
  console.log(`Added ${articleRoutes} article route(s)\n`);

  console.log("Generating sitemap XML...");
  const sitemapXML = generateSitemapXML(urls);
  const outputPath = path.join(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outputPath, sitemapXML);

  console.log("Sitemap generated successfully");
  console.log(`Location: ${outputPath}`);
  console.log(`Total URLs: ${urls.length}`);
  console.log(` - Public route inventory: ${SITEMAP_ROUTES.length}`);
  console.log(` - API event routes: ${apiEventRoutes}`);
  console.log(` - Archive event routes: ${archiveEventRoutes}`);
  console.log(` - Article routes: ${articleRoutes}\n`);

  return {
    totalUrls: urls.length,
    apiEventRoutes,
    archiveEventRoutes,
    articleRoutes,
  };
}

if (require.main === module) {
  generateSitemap().catch((error) => {
    console.error("\nError generating sitemap:", error.message);
    process.exit(1);
  });
}

module.exports = {
  archiveEvents,
  fetchArticles,
  fetchEvents,
  generateSitemap,
  generateSitemapXML,
  routeForApiArticle,
  routeForApiEvent,
};
