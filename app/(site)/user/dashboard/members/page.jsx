import BackofficeAccounts from "@/elements/backoffice/BackofficeAccounts";
import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_3 } from "@/util/defines/common";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts back office", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthLayout access={ACCESS_3}><BackofficeAccounts /></AuthLayout>;
}
