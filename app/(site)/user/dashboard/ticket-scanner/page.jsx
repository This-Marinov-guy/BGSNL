import { Suspense } from "react";
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
      <Suspense fallback={<p>Loading ticket scanner…</p>}><CheckTicket /></Suspense>
    </AuthLayout>
  );
}
