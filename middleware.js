/* global process */
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

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function metaHtml({ title, description, image, url, type }) {
  const t = (title || "BGSNL – Your Home Away From Home").replace(
    /"/g,
    "&quot;"
  );
  const d = (
    description || "The official website of the Bulgarian Society Netherlands."
  ).replace(/"/g, "&quot;");
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
<body><p>Redirecting to <a href="${u}">${t}</a>...</p></body>
</html>`;
}

const STATIC_META = [
  {
    pattern: /^\/other-event-details\/gala-festival$/,
    meta: {
      title: "Joint Gala Festival",
      description:
        "Join us for the Joint Gala Festival - a cultural gathering that celebrates identity, creativity, and youth through shared artistic expression.",
      image: `${SITE_URL}/assets/images/events/gala/poster.png`,
      url: `${SITE_URL}/other-event-details/gala-festival`,
      type: "event",
    },
  },
  {
    pattern: /^\/(?:[^/]+\/)?signup$/,
    meta: {
      title: "Become a Member - BGSNL",
      description:
        "Join the Bulgarian Society Netherlands during your academic years. Get event discounts, explore internship options, and get the chance to enter a committee or board.",
      image: `${SITE_URL}/assets/images/alumni/members.jpg`,
      url: `${SITE_URL}/signup`,
    },
  },
  {
    pattern: /^\/alumni\/register$/,
    meta: {
      title: "Become an Alumni - BGSNL",
      description:
        "Support the Bulgarian Society Netherlands as a post-graduate alumni. Network with the community, attend alumni events, and aid our mission.",
      image: `${SITE_URL}/assets/images/alumni/alumni.jpeg`,
      url: `${SITE_URL}/alumni/register`,
    },
  },
];

function getStaticMeta(pathname) {
  const match = STATIC_META.find(({ pattern }) => pattern.test(pathname));
  return match?.meta;
}

function htmlResponse(html, source) {
  return new Response(html, {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
      "x-bgsnl-meta-source": source,
    },
  });
}

// Skip files with extensions (.js, .css, .png ...) and Vercel internals
export const config = {
  matcher: ["/((?!_vercel|.*\\..*).*)", "/"],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const ua = request.headers.get("user-agent") || "";
  const debugMode =
    url.searchParams.has("__meta") ||
    request.headers.get("x-bgsnl-debug-meta") === "1";

  // Regular browsers pass straight through — Vercel serves the SPA as normal.
  if (!debugMode && !isCrawler(ua)) return;

  const staticMeta = getStaticMeta(pathname);
  if (staticMeta) {
    return htmlResponse(
      metaHtml({
        ...staticMeta,
        url: `${SITE_URL}${pathname}`,
      }),
      "static"
    );
  }

  const eventMatch =
    pathname.match(/^\/[^/]+\/event-details\/([^/]+)$/) ||
    pathname.match(/^\/[^/]+\/purchase-ticket\/([^/]+)$/);

  if (!eventMatch) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_URL}/event/event-details/${eventMatch[1]}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return;

    const data = await res.json();
    const event = data && data.event;
    if (!event) return;

    return htmlResponse(
      metaHtml({
        title: event.newTitle || event.title,
        description: stripHtml(event.description || event.text),
        image: event.poster ? `${SITE_URL}${event.poster}` : undefined,
        url: `${SITE_URL}${pathname}`,
        type: "event",
      }),
      "event"
    );
  } catch (_) {
    // API unreachable or timed out — fall through and let Vercel serve index.html
  }
}
