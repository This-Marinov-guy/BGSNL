import { notFound } from "next/navigation";
import TicketComponent from "@/screens/private/TicketComponent";
import TicketPlayground from "@/screens/private/TicketPlayground";
import WhatsNewPreview from "@/screens/private/WhatsNewPreview";
import PaymentResultPreview from "@/screens/private/PaymentResultPreview";

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
  "whats-new": WhatsNewPreview,
  "payment-result": PaymentResultPreview,
};

export const dynamicParams = false;

export function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];
  return Object.keys(SCREENS).map((devPage) => ({ devPage }));
}

export const metadata = { robots: { index: false, follow: false } };

// Next.js owns and validates these asynchronous route props.
// eslint-disable-next-line react/prop-types
export default async function Page({ params, searchParams }) {
  const { devPage } = await params;
  const Screen = SCREENS[devPage];

  if (!Screen) notFound();

  if (devPage === "payment-result") {
    const query = await searchParams;
    return <PaymentResultPreview outcome={typeof query?.status === "string" ? query.status : "success"} free={query?.free === "true"} />;
  }

  return <Screen />;
}
