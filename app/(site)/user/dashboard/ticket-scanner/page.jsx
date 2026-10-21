import { Suspense } from "react";
import PropTypes from "prop-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoadingSkeleton } from "@/elements/ui/loading/LoadState";
import ScannerSessionHydrator from "@/screens/redirects/ScannerSessionHydrator";
import { cookieNames, publicSession } from "@/util/auth/cookie-policy.mjs";
import { SCANNER_PATH, scannerPathWithSearch } from "@/util/auth/scanner-return.mjs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket scanner",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
};

export default async function Page({ searchParams }) {
  const returnTo = scannerPathWithSearch(await searchParams);
  const names = cookieNames(process.env.NODE_ENV === "production");
  const token = (await cookies()).get(names.session)?.value;
  const session = publicSession(token, Date.now(), { allowExpired: true });
  if (!session || session.exp * 1000 <= Date.now()) {
    redirect(`${SCANNER_PATH}/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }
  if (session.accessExp * 1000 <= Date.now() + 15000) {
    redirect(`${SCANNER_PATH}/renew?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return <Suspense fallback={<LoadingSkeleton label="Loading ticket scanner" variant="cards" />}>
    <ScannerSessionHydrator session={session} />
  </Suspense>;
}

Page.propTypes = { searchParams: PropTypes.object };
