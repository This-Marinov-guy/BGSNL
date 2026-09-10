import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

const BASE_URL = "https://www.bulgariansociety.nl";

const PRIVATE_PATHS = [
  "/user",
  "/user/",
  "/login",
  "/signup",
  "/alumni/register",
  "/success",
  "/fail",
  "/donation/success",
  "/payment/",
  "/dev/",
  ...REGIONS.flatMap((region) => [
    `/${region}/signup`,
    `/${region}/purchase-ticket/`,
  ]),
];

const DISCOVERY_AGENTS = [
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
];

const TRAINING_AGENTS = [
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "ClaudeBot",
  "Google-Extended",
  "GPTBot",
  "meta-externalagent",
];

const USER_FETCH_AGENTS = ["ChatGPT-User", "Claude-User", "Perplexity-User"];

/**
 * Replaces public/robots.txt. Driving the per-region purchase-ticket rules off
 * REGIONS means a new region can't be forgotten here.
 */
export default function robots() {
  return {
    rules: [
      // General search crawlers may request these routes so they can read the
      // stronger page/header-level noindex instruction. robots.txt alone can
      // still leave a URL-only result in an index.
      { userAgent: "*", allow: "/" },
      {
        userAgent: DISCOVERY_AGENTS,
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: TRAINING_AGENTS,
        disallow: "/",
      },
      {
        userAgent: USER_FETCH_AGENTS,
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
