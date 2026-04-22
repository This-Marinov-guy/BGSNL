const SITE_URL = "https://www.bulgariansociety.nl";
const API_URL =
  process.env.REACT_APP_SERVER_URL ||
  "https://api.bulgariansociety.nl/api";

const CRAWLER_RE =
  /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|googlebot|bingbot|yandexbot|applebot|embedly|outbrain|pinterest|quora link preview|rogerbot|showyoubot|developers\.google\.com/i;

function isCrawler(ua) {
  return CRAWLER_RE.test(ua || "");
}

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);
}

function metaHtml({ title, description, image, url, type }) {
  const t = (title || "BGSNL – Your Home Away From Home").replace(/"/g, "&quot;");
  const d = (description || "The official website of the Bulgarian Society Netherlands.").replace(/"/g, "&quot;");
  const img = image || `${SITE_URL}/assets/images/bg/welcome.png`;
  const u = url || SITE_URL;
  const og = type || "website";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${u}">
  <meta property="og:type" content="${og}">
  <meta property="og:site_name" content="BGSNL">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
  <meta http-equiv="refresh" content="0;url=${u}">
</head>
<body><p>Redirecting to <a href="${u}">${t}</a>…</p></body>
</html>`;
}

const STATIC_META = {
  "/other-event-details/gala-festival": {
    title: "Joint Gala Festival",
    description:
      "Join us for the Joint Gala Festival – a cultural gathering that celebrates identity, creativity, and youth through shared artistic expression.",
    image: `${SITE_URL}/assets/images/events/gala/poster.png`,
    url: `${SITE_URL}/other-event-details/gala-festival`,
    type: "event",
  },
  "/signup": {
    title: "Become a Member – BGSNL",
    description:
      "Join the Bulgarian Society Netherlands during your academic years. Get event discounts, explore internship options, and get the chance to enter a committee or board.",
    image: `${SITE_URL}/assets/images/alumni/members.jpg`,
    url: `${SITE_URL}/signup`,
  },
  "/alumni/register": {
    title: "Become an Alumni – BGSNL",
    description:
      "Support the Bulgarian Society Netherlands as a post-graduate alumni. Network with the community, attend alumni events, and aid our mission.",
    image: `${SITE_URL}/assets/images/alumni/alumni.jpeg`,
    url: `${SITE_URL}/alumni/register`,
  },
};

// Skip files with extensions (.js, .css, .png …) and Vercel internals
export const config = {
  matcher: ["/((?!_vercel|.*\\..*).*)", "/"],
};

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!isCrawler(ua)) return; // regular browsers → Vercel serves static SPA as normal

  const { pathname } = new URL(request.url);

  // Static pages — no API call needed
  if (STATIC_META[pathname]) {
    return new Response(metaHtml(STATIC_META[pathname]), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Dynamic event pages — fetch from Express API
  const eventMatch =
    pathname.match(/^\/[^/]+\/event-details\/([^/]+)$/) ||
    pathname.match(/^\/[^/]+\/purchase-ticket\/([^/]+)$/) ||
    pathname.match(/^\/[^/]+\/member-purchase\/([^/]+)$/);

  if (eventMatch) {
    try {
      const res = await fetch(`${API_URL}/event/event-details/${eventMatch[1]}`);
      if (res.ok) {
        const data = await res.json();
        const event = data && data.event;
        if (event) {
          return new Response(
            metaHtml({
              title: event.newTitle || event.title,
              description: stripHtml(event.description || event.text),
              image: event.poster ? `${SITE_URL}${event.poster}` : undefined,
              url: `${SITE_URL}${pathname}`,
              type: "event",
            }),
            { headers: { "content-type": "text/html; charset=utf-8" } }
          );
        }
      }
    } catch (_) {
      // API unreachable — fall through and let Vercel serve index.html
    }
  }
}
