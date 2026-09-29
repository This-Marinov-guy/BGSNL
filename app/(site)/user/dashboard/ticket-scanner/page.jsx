import { Suspense } from "react";
import { LoadingSkeleton } from "@/elements/ui/loading/LoadState";
import AuthLayout from "@/layouts/authentication/AuthLayout";
import CheckTicket from "@/screens/redirects/CheckTicket";
import { ACCESS_4 } from "@/util/defines/common";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ticket scanner",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_4}>
      <Suspense fallback={<LoadingSkeleton label="Loading ticket scanner" variant="cards" />}><CheckTicket /></Suspense>
    </AuthLayout>
  );
}
