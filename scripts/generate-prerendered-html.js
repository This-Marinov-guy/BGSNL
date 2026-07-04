const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const {
  AUTHORITY_SOURCES,
  SEO_PAGES,
  SHARED_LINKS,
  SITE_URL,
} = require("./seo-page-data");
const {
  fetchArticles,
  routeForApiArticle,
} = require("./generate-sitemap");

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://kanatitsa.bulgariansociety.nl/api/";
const ARTICLE_REQUEST_HEADERS = { Origin: SITE_URL };
const REGION_LOGO_ALIASES = {
  breda: "breda_tilburg",
};

function generatePrerenderedHtml({
  buildDir = path.join(__dirname, "..", "build"),
  pages = SEO_PAGES,
} = {}) {
  const indexPath = path.join(buildDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing Vite build shell at ${indexPath}. Run vite build first.`);
  }

  const template = fs.readFileSync(indexPath, "utf8");
  const written = [];

  for (const page of pages) {
    const html = renderPageHtml(template, page);
    const outPath = outputPathForRoute(buildDir, page.path);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, "utf8");
    written.push({ path: page.path, file: outPath });
  }

  return written;
}

async function generateAllPrerenderedHtml(options = {}) {
  const publicPages = generatePrerenderedHtml(options);
  const articlePages = await generateArticlePrerenderedHtml(options);
  return [...publicPages, ...articlePages];
}

async function generateArticlePrerenderedHtml({
  buildDir = path.join(__dirname, "..", "build"),
} = {}) {
  const indexPath = path.join(buildDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing Vite build shell at ${indexPath}. Run vite build first.`);
  }

  const template = fs.readFileSync(indexPath, "utf8");
  const articles = await fetchArticles();
  const written = [];

  for (const article of articles) {
    const detail = await fetchArticleDetail(article.id);
    const page = articlePageFromApiArticle(article, detail);
    if (!page) continue;

    const html = renderPageHtml(template, page);
    const outPath = outputPathForRoute(buildDir, page.path);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, "utf8");
    written.push({ path: page.path, file: outPath });
  }

  return written;
}

async function fetchArticleDetail(articleId) {
  if (!articleId) return null;
  try {
    const response = await axios.get(`${SERVER_URL}wordpress/posts/${articleId}`, {
      timeout: 10000,
      headers: ARTICLE_REQUEST_HEADERS,
    });
    return response.data?.data || response.data?.post || response.data || null;
  } catch (error) {
    console.warn(`Article detail unavailable for ${articleId}: ${error.message}`);
    return null;
  }
}

function articlePageFromApiArticle(summary, detail = {}) {
  const route = routeForApiArticle(summary);
  if (!route) return null;

  const routePath = new URL(route.loc).pathname;
  const title = detail?.title || summary.title;
  const articleHtml = sanitizeArticleHtml(detail?.content || "");
  const plainArticleText = stripHtml(articleHtml);
  const description = truncateText(
    summary.description || detail?.description || detail?.excerpt || plainArticleText || `Read ${title} from Bulgarian Society Netherlands.`,
    160,
  );

  return {
    path: routePath,
    url: `${SITE_URL}${routePath}`,
    title: `${title} | BGSNL`,
    h1: title,
    description,
    answer: `Quick answer: ${title} is a Bulgarian Society Netherlands article for students, members, and the wider BGSNL community.`,
    intent: "article detail",
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "Article",
    image: summary.thumbnail || detail?.thumbnail || detail?.featured_image || detail?.image || `${SITE_URL}/assets/images/avatars/article.png`,
    keywords: [
      title,
      "BGSNL article",
      "Bulgarian Society Netherlands",
      "Bulgarian students Netherlands",
    ],
    body: [
      description,
      "This article is part of the Bulgarian Society Netherlands article archive and connects readers back to BGSNL community, events, and membership pages.",
    ],
    articleHtml: articleHtml || `<p>${escapeHtml(description)}</p>`,
    faq: [],
    citations: [],
    internalLinks: [
      { href: "/articles", label: "All BGSNL articles" },
      { href: "/about", label: "About Bulgarian Society Netherlands" },
      { href: "/join-the-society", label: "Join BGSNL" },
      { href: "/events/future-events", label: "Upcoming BGSNL events" },
      ...SHARED_LINKS,
    ],
    includeOrganization: true,
    includeWebSite: false,
    archiveEvents: [],
    archiveStats: null,
    archiveCityLinks: [],
  };
}

function renderPageHtml(template, page) {
  let html = template;
  html = html.replace(/<html\b[^>]*>/i, '<html lang="en">');
  html = replaceTitle(html, page.title);
  html = upsertMetaName(html, "description", page.description);
  html = upsertMetaName(html, "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  html = upsertMetaProperty(html, "og:type", page.schemaType === "Article" ? "article" : "website");
  html = upsertMetaProperty(html, "og:url", page.url);
  html = upsertMetaProperty(html, "og:title", page.title);
  html = upsertMetaProperty(html, "og:description", page.description);
  html = upsertMetaProperty(html, "og:image", page.image);
  html = upsertMetaName(html, "twitter:card", "summary_large_image");
  html = upsertMetaName(html, "twitter:url", page.url);
  html = upsertMetaName(html, "twitter:title", page.title);
  html = upsertMetaName(html, "twitter:description", page.description);
  html = upsertMetaName(html, "twitter:image", page.image);
  html = replaceCanonical(html, page.url);
  html = replaceStructuredData(html, buildSchemas(page));
  html = replaceRoot(html, renderStaticContent(page));
  return html;
}

function replaceTitle(html, title) {
  const escaped = escapeHtml(title);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escaped}</title>`);
  }
  return html.replace(/<\/head>/i, `  <title>${escaped}</title>\n</head>`);
}

function upsertMetaName(html, name, content) {
  const escapedName = escapeAttribute(name);
  const tag = `<meta name="${escapedName}" content="${escapeAttribute(content)}">`;
  const re = new RegExp(`<meta\\s+[^>]*name=["']${escapeRegExp(name)}["'][^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertMetaProperty(html, property, content) {
  const escapedProperty = escapeAttribute(property);
  const tag = `<meta property="${escapedProperty}" content="${escapeAttribute(content)}">`;
  const re = new RegExp(`<meta\\s+[^>]*property=["']${escapeRegExp(property)}["'][^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceCanonical(html, url) {
  const withoutCanonical = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "");
  return withoutCanonical.replace(
    /<\/head>/i,
    `  <link rel="canonical" href="${escapeAttribute(url)}">\n</head>`,
  );
}

function replaceStructuredData(html, schemas) {
  const withoutJsonLd = html.replace(
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    "",
  );
  const scripts = schemas
    .map((schema) => `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n");
  return withoutJsonLd.replace(/<\/head>/i, `${scripts}\n</head>`);
}

function replaceRoot(html, content) {
  const root = `<div id="root">\n${content}\n    </div>`;
  const rootRange = findRootDivRange(html);
  if (!rootRange) return html;
  return `${html.slice(0, rootRange.start)}${root}${html.slice(rootRange.end)}`;
}

function findRootDivRange(html) {
  const rootStart = /<div\b[^>]*\bid=(["'])root\1[^>]*>/i.exec(html);
  if (!rootStart) return null;

  const divTag = /<\/?div\b[^>]*>/gi;
  divTag.lastIndex = rootStart.index + rootStart[0].length;
  let depth = 1;
  let match;

  while ((match = divTag.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      return {
        start: rootStart.index,
        end: divTag.lastIndex,
      };
    }
  }

  return null;
}

function renderStaticContent(page) {
  const body = page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n        ");
  const archive = renderArchiveContent(page);
  const article = page.articleHtml
    ? `<section class="article-prerender-content">
          ${page.articleHtml}
        </section>`
    : "";
  const links = page.internalLinks
    .map((link) => `<li><a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("\n          ");
  const citations = page.citations
    .map((source) => `<li><a href="${escapeAttribute(source.url)}">${escapeHtml(source.name)}</a>: ${escapeHtml(source.label)}</li>`)
    .join("\n          ");
  const faq = page.faq
    .map((item) => [
      "<article>",
      `            <h3>${escapeHtml(item.question)}</h3>`,
      `            <p>${escapeHtml(item.answer)}</p>`,
      "          </article>",
    ].join("\n"))
    .join("\n          ");

  return `      <main data-bgsnl-prerender="true" class="seo-prerender">
        <section>
          <p>Quick answer</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p>${escapeHtml(page.answer)}</p>
        </section>
        <section>
          <h2>What this page answers</h2>
          ${body || `<p>${escapeHtml(page.description)}</p>`}
        </section>
        ${article}
        ${archive}
        <nav aria-label="BGSNL internal links">
          <h2>Explore Bulgarian Society Netherlands</h2>
          <ul>
          ${links}
          </ul>
        </nav>
        ${citations ? `<section>
          <h2>Sources used</h2>
          <ul>
          ${citations}
          </ul>
        </section>` : ""}
        ${faq ? `<section>
          <h2>Questions answered</h2>
          ${faq}
        </section>` : ""}
      </main>`;
}

function renderArchiveContent(page) {
  if (!page.archiveStats || !Array.isArray(page.archiveEvents) || page.archiveEvents.length === 0) {
    return "";
  }

  const cityLinks = (page.archiveCityLinks ?? [])
    .map((link) => {
      const region = regionFromArchiveHref(link.href);
      const logo = region ? `<img class="archive-city-logo" src="${escapeAttribute(regionLogoPath(region))}" alt="" aria-hidden="true" loading="lazy"> ` : "";
      return `<a href="${escapeAttribute(link.href)}">${logo}${escapeHtml(link.label)}</a>`;
    })
    .join("\n            ");

  const events = page.archiveEvents
    .map((event) => {
      const tags = archiveEventBadges(event)
        .map((badge) => `<span>${escapeHtml(badge)}</span>`)
        .join(" ");
      const context = archiveEventContext(event);
      const contextHtml = context
        ? `<p class="archive-event-context">${escapeHtml(context)}</p>`
        : "";
      const details = archiveEventDetails(event)
        .map((detail) => `<div><dt>${escapeHtml(detail.label)}</dt><dd>${escapeHtml(detail.value)}</dd></div>`)
        .join("");

      return `<article class="archive-event-card">
            <div class="archive-event-card-header">
              <img class="archive-event-logo" src="${escapeAttribute(regionLogoPath(event.region))}" alt="${escapeAttribute(event.regionName)} logo" loading="lazy">
              <div class="archive-event-tags">${tags}</div>
            </div>
            <h3>${escapeHtml(event.title)}</h3>
            ${contextHtml}
            <dl class="archive-event-detail-list">
              ${details}
            </dl>
          </article>`;
    })
    .join("\n          ");

  return `<section class="past-events-archive">
          <h2>BGSNL past events archive</h2>
          <p>${escapeHtml(page.archiveStats.totalEvents)} archived public events across ${escapeHtml(page.archiveStats.totalRegions)} regions.</p>
          ${cityLinks ? `<nav class="archive-city-quick-links" aria-label="Browse past events by city">
            <span>Browse cities</span>
            ${cityLinks}
          </nav>` : ""}
          <div class="archive-event-grid">
          ${events}
          </div>
        </section>`;
}

function buildSchemas(page) {
  const schemas = [];
  if (page.includeOrganization) schemas.push(organizationSchema());
  if (page.includeWebSite) schemas.push(websiteSchema());
  schemas.push(webPageSchema(page));
  if (page.faq.length > 0) schemas.push(faqSchema(page));
  if ((page.archiveEvents ?? []).length > 0) schemas.push(itemListSchema(page));
  schemas.push(breadcrumbSchema(page));
  return schemas;
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Bulgarian Society Netherlands",
    alternateName: "BGSNL",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/images/logo/logo-nl.png`,
    description:
      "Bulgarian Society Netherlands (BGSNL) connects Bulgarian students and young Bulgarians across the Netherlands through local city communities, cultural events, practical support, and career opportunities.",
    sameAs: [
      "https://www.instagram.com/bulgariansociety.netherlands/",
      "https://www.linkedin.com/company/bulgarian-society-netherlands",
      ...AUTHORITY_SOURCES.map((source) => source.url),
    ],
    areaServed: [
      "Amsterdam",
      "Rotterdam",
      "Groningen",
      "Leeuwarden",
      "Maastricht",
      "Eindhoven",
      "Breda",
      "Tilburg",
      "Leiden",
      "The Hague",
      "Netherlands",
    ].map((name) => ({
      "@type": name === "Netherlands" ? "Country" : "City",
      name,
    })),
    knowsAbout: [
      "Bulgarian students in the Netherlands",
      "Bulgarian culture",
      "Student events",
      "Internships",
      "Community support",
    ],
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Bulgarian Society Netherlands",
    alternateName: "BGSNL",
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

function webPageSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": page.schemaType,
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.title,
    headline: page.h1,
    description: page.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: page.includeOrganization ? { "@id": `${SITE_URL}/#organization` } : undefined,
  };
}

function faqSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${page.url}#faq`,
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function itemListSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${page.url}#past-events`,
    name: page.h1,
    numberOfItems: page.archiveEvents.length,
    itemListElement: page.archiveEvents.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: event.date ? eventSchema(event) : archiveRecordSchema(event),
    })),
  };
}

function eventSchema(event) {
  return {
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.date,
    eventStatus: "https://schema.org/EventCompleted",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.regionName,
        addressCountry: "NL",
      },
    },
    organizer: { "@id": `${SITE_URL}/#organization` },
    keywords: event.tags,
  };
}

function archiveRecordSchema(event) {
  return {
    "@type": "CreativeWork",
    name: event.title,
    description: archiveEventContext(event),
    about: { "@id": `${SITE_URL}/#organization` },
    spatialCoverage: {
      "@type": "City",
      name: event.regionName,
    },
    keywords: event.tags,
  };
}

function breadcrumbSchema(page) {
  const parts = page.path === "/" ? [] : page.path.split("/").filter(Boolean);
  const elements = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE_URL}/`,
    },
  ];

  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    elements.push({
      "@type": "ListItem",
      position: index + 2,
      name: labelFromPathPart(part),
      item: `${SITE_URL}${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elements,
  };
}

function formatArchiveDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function archiveEventBadges(event) {
  return [
    "Past event",
    ...(event.tags?.length > 0 ? event.tags : ["community"]),
  ];
}

function archiveEventDetails(event) {
  return [
    event.date ? { label: "Date", value: formatArchiveDate(event.date) } : null,
    { label: "City", value: event.regionName },
    event.location ? { label: "Venue", value: event.location } : null,
  ].filter(Boolean);
}

function archiveEventContext(event) {
  return event.summary || `A BGSNL past event in ${event.regionName}.`;
}

function regionLogoPath(region) {
  return `/assets/images/logo/${REGION_LOGO_ALIASES[region] || region}.webp`;
}

function regionFromArchiveHref(href) {
  return String(href ?? "").split("/").filter(Boolean)[0] || "";
}

function outputPathForRoute(buildDir, routePath) {
  if (routePath === "/") return path.join(buildDir, "index.html");
  const segments = routePath.replace(/^\/+|\/+$/g, "").split("/");
  return path.join(buildDir, ...segments, "index.html");
}

function labelFromPathPart(part) {
  return part
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeArticleHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+=(["']).*?\1/gi, "");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

if (require.main === module) {
  generateAllPrerenderedHtml()
    .then((written) => {
      console.log(`Prerendered ${written.length} route HTML file(s).`);
    })
    .catch((error) => {
      console.error(`Failed to prerender HTML: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  articlePageFromApiArticle,
  buildSchemas,
  fetchArticleDetail,
  generateAllPrerenderedHtml,
  generateArticlePrerenderedHtml,
  generatePrerenderedHtml,
  renderPageHtml,
  renderStaticContent,
};
