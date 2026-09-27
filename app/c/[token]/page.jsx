import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { loadPublicCard } from "@/util/wallet/public-card-server";
import PublicCard from "@/elements/wallet/PublicCard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Membership card", robots: { index: false, follow: false }, referrer: "no-referrer", alternates: { canonical: null } };
// Next.js supplies the asynchronous route params.
// eslint-disable-next-line react/prop-types
export default async function Page({ params }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) notFound();
  const result = await loadPublicCard(token, await headers());
  return <PublicCard key={token} token={token} initialResult={result.data || null} initialError={result.status === 200 ? "" : result.status === 404 ? "This card is unavailable or its link has been revoked." : "Current membership status could not be verified."} />;
}
