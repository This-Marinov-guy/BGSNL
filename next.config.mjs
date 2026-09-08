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
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,

  async headers() {
    return privateRouteSources.map((source) => ({
      source,
      headers: [
        ...privateIndexingHeaders.map((header) =>
          header.key === "Referrer-Policy" && (source === "/login" || source.startsWith("/user"))
            ? { ...header, value: process.env.NODE_ENV === "development" ? "no-referrer-when-downgrade" : "strict-origin-when-cross-origin" }
            : header),
        ...(source === "/login" || source.startsWith("/user")
          ? [{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }]
          : []),
        ...(source.startsWith("/user")
          ? [{ key: "Cache-Control", value: "private, no-store" }]
          : []),
      ],
    }));
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
