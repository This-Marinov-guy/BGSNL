import { notFound } from "next/navigation";
import TicketComponent from "@/screens/private/TicketComponent";
import TicketPlayground from "@/screens/private/TicketPlayground";

/**
 * The old SPA registered /test and /playground only when !isProd().
 *
 * File-based routing can't conditionally declare a route, and notFound() can't
 * produce a hard 404 once the client shell has started streaming — it yields a
 * soft 404 (200 with 404 content). Rejecting at the routing layer is the only
 * reliable option, so these live behind a dynamic segment whose allowed values
 * are empty in production. Note the URLs are now /dev/test and /dev/playground:
 * a dynamic segment at the root would collide with (site)/[region].
 */
const SCREENS = {
  test: TicketComponent,
  playground: TicketPlayground,
};

export const dynamicParams = false;

export function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];
  return Object.keys(SCREENS).map((devPage) => ({ devPage }));
}

export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }) {
  const { devPage } = await params;
  const Screen = SCREENS[devPage];

  if (!Screen) notFound();

  return <Screen />;
}
