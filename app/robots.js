import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

const BASE_URL = "https://www.bulgariansociety.nl";

/**
 * Replaces public/robots.txt. Driving the per-region purchase-ticket rules off
 * REGIONS means a new region can't be forgotten here.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/user/",
        "/login",
        "/signup",
        "/alumni/register",
        ...REGIONS.map((region) => `/${region}/purchase-ticket/`),
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
