import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const privateIndexingHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const privateRouteSources = [
  "/user/:path*",
  "/login",
  "/signup",
  "/:region/signup",
  "/alumni/register",
  "/:region/purchase-ticket/:path*",
  "/success",
  "/fail",
  "/donation/success",
  "/payment/:path*",
  "/account/confirm",
  "/dev/:path*",
  "/api/:path*",
];

// Public files keep stable URLs, so use a conservative browser TTL. Vercel's
// edge cache already stores them, but without max-age every repeat visit still
// reaches the CDN and counts as another Edge Request.
const browserCachedPublicSources = [
  "/assets/:path*",
  "/ads.txt",
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
];

const browserCachedPublicHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=604800",
  },
];

const discoverySources = ["/llms.txt", "/sitemap.xml"];

// These endpoints are generated from live public records. Avoid serving a
// previously cached sitemap after an event is published or archived.
const discoveryHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, must-revalidate",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,

  async headers() {
    return [
      ...privateRouteSources.map((source) => ({
        source,
        headers: [
          ...privateIndexingHeaders.map((header) =>
            header.key === "Referrer-Policy" && (source === "/login" || source.startsWith("/user"))
              ? { ...header, value: process.env.NODE_ENV === "development" ? "no-referrer-when-downgrade" : "strict-origin-when-cross-origin" }
              : header),
          ...(source === "/login" || source.startsWith("/user")
            ? [{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }]
            : []),
          ...(source.startsWith("/user") || ["/success", "/fail", "/donation/success", "/payment/:path*"].includes(source)
            ? [{ key: "Cache-Control", value: "private, no-store" }]
            : []),
        ],
      })),
      ...browserCachedPublicSources.map((source) => ({
        source,
        headers: browserCachedPublicHeaders,
      })),
      ...discoverySources.map((source) => ({
        source,
        headers: discoveryHeaders,
      })),
    ];
  },

  // The legacy template SCSS lives under public/assets and uses `~pkg` imports.
  sassOptions: {
    includePaths: [
      path.join(__dirname, "public/assets/scss"),
      path.join(__dirname, "node_modules"),
    ],
    quietDeps: true,
    silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
  },

  // 400+ pre-sized static images already live in public/assets.
  images: {
    unoptimized: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@assets": path.join(__dirname, "public/assets"),
      "~bootstrap": path.join(__dirname, "node_modules/bootstrap"),
      "~slick-carousel": path.join(__dirname, "node_modules/slick-carousel"),
    };
    return config;
  },
};

export default nextConfig;
