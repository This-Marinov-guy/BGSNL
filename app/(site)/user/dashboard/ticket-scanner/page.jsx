import { Suspense } from "react";
import PropTypes from "prop-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoadingSkeleton } from "@/elements/ui/loading/LoadState";
import CheckTicket from "@/screens/redirects/CheckTicket";
import ScannerSessionHydrator from "@/screens/redirects/ScannerSessionHydrator";
import { cookieNames, publicSession } from "@/util/auth/cookie-policy.mjs";
import { verifyScannerAccess } from "@/util/auth/scanner-access";
import { SCANNER_PATH, scannerPathWithSearch } from "@/util/auth/scanner-return.mjs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket scanner",
  robots: { index: false, follow: false },
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

  const access = await verifyScannerAccess(token);
  if (access.status === 401) redirect(`${SCANNER_PATH}/renew?returnTo=${encodeURIComponent(returnTo)}`);
  if (access.status === 403) redirect("/user");
  if (access.status !== 200) {
    return <main className="container" style={{ paddingBlock: "5rem" }}>
      <h1>Ticket scanner unavailable</h1>
      <p>We could not verify scanner access. Please try again.</p>
      <a className="rn-button-style--2 rn-btn-green" href={returnTo}>Retry</a>
    </main>;
  }

  return <Suspense fallback={<LoadingSkeleton label="Loading ticket scanner" variant="cards" />}>
    <ScannerSessionHydrator session={{ ...session, userId: access.userId, roles: access.roles,
      status: access.accountStatus, region: access.region }}>
      <CheckTicket scannerUserId={access.userId} />
    </ScannerSessionHydrator>
  </Suspense>;
}

Page.propTypes = { searchParams: PropTypes.object };
