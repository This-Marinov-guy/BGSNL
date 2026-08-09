import { notFound } from "next/navigation";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

/**
 * Replaces src/layouts/common/RegionLayout.jsx, which redirected to /404 with
 * react-router's <Navigate>. A static segment (/about, /login, ...) always wins
 * over [region], so only genuinely unknown single segments reach this check.
 *
 * The allow-list is enforced at the routing layer rather than only via
 * notFound(): by the time a layout renders, the shell has already streamed with
 * a 200, so notFound() alone would produce a soft 404 that crawlers index.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return REGIONS.map((region) => ({ region }));
}

export default async function RegionSegmentLayout({ children, params }) {
  const { region } = await params;

  if (!REGIONS.includes(region)) {
    notFound();
  }

  return children;
}
