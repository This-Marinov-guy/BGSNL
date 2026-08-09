import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

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

  eslint: {
    ignoreDuringBuilds: true,
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
