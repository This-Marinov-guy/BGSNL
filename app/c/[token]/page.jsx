import { notFound } from "next/navigation";
import PublicCard from "@/elements/wallet/PublicCard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Membership card", robots: { index: false, follow: false }, referrer: "no-referrer", alternates: { canonical: null } };
// Next.js supplies the asynchronous route params.
// eslint-disable-next-line react/prop-types
export default async function Page({ params }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) notFound();
  return <PublicCard key={token} token={token} />;
}
