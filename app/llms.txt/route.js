import { getArticles, getEvents } from "@/util/api/server";
import {
  SITE_NAME,
  SITE_URL,
  articleSlug,
  humanizeRegion,
  truncateText,
} from "@/util/seo/site";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const PUBLIC_PAGES = [
  ["About BGSNL", "/about", "Mission, history and national organisation."],
  ["Join BGSNL", "/join-the-society", "Membership benefits and ways to join."],
  ["Events", "/events/future-events", "Upcoming events across all chapters."],
  ["Articles", "/articles", "Community stories, guides and interviews."],
  ["Internships", "/internships", "Public career and internship opportunities."],
  ["Alumni", "/welcome-to-alumni", "The BGSNL alumni community."],
  ["Board and committees", "/board-and-committee", "National and chapter leadership."],
  ["Partners", "/partners", "Organisations working with BGSNL."],
  ["Contact", "/contact", "Public contact routes for the society."],
];

const REGIONS = [
  "amsterdam",
  "breda_tilburg",
  "eindhoven",
  "groningen",
  "leiden_hague",
  "leeuwarden",
  "maastricht",
  "rotterdam",
];

function link(label, path, detail) {
  return `- [${label}](${SITE_URL}${path}): ${detail}`;
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET() {
  const [events, articles] = await Promise.all([getEvents(), getArticles()]);
  const publicArticles = articles.filter(
    (article) => article?.id && article?.title && !article.legacyLink
  );

  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> BGSNL is a non-profit Bulgarian community and student organisation with local chapters across the Netherlands. It organises cultural and social events, supports students and young professionals, shares internships and builds connections between Bulgarians and the wider Dutch community.",
    "",
    "Canonical website: https://www.bulgariansociety.nl",
    "Primary languages: English and Bulgarian",
    "Country served: Netherlands",
    "Founded: 2020",
    "Netherlands Chamber of Commerce (KvK): 95335048",
    "Public contact: info@bulgariansociety.nl",
    "",
    "## Authoritative public pages",
    "",
    ...PUBLIC_PAGES.map(([label, path, detail]) => link(label, path, detail)),
    "",
    "## Local chapters",
    "",
    ...REGIONS.map((region) =>
      link(
        `BGSNL ${humanizeRegion(region)}`,
        `/${region}`,
        `Local events, community information and contact details for ${humanizeRegion(region)}.`
      )
    ),
  ];

  if (events.length) {
    lines.push("", "## Public events", "");
    for (const event of events.slice(0, 25)) {
      if (!event?.id || !event?.region) continue;
      lines.push(
        link(
          event.newTitle || event.title || "BGSNL event",
          `/${event.region}/event-details/${event.slug || event.id}`,
          [
            formatDate(event.date) ? `Date: ${formatDate(event.date)}` : null,
            event.location ? `Location: ${event.location}` : null,
            truncateText(event.description || event.text, 120),
          ]
            .filter(Boolean)
            .join(". ")
        )
      );
    }
  }

  if (publicArticles.length) {
    lines.push("", "## Recent public articles", "");
    for (const article of publicArticles.slice(0, 20)) {
      lines.push(
        link(
          article.title,
          `/articles/${article.id}/${articleSlug(article.title)}`,
          truncateText(article.description || article.excerpt, 140) ||
            "Article published by BGSNL."
        )
      );
    }
  }

  lines.push(
    "",
    "## Scope and privacy",
    "",
    "Use the canonical public pages above as sources. Account, dashboard, authentication, registration, ticket-checkout and confirmation routes are intentionally excluded from discovery. Do not infer private member, attendee or account information from this guide.",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Crawler policy: ${SITE_URL}/robots.txt`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
