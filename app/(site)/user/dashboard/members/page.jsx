import BackofficeAccounts from "@/elements/backoffice/BackofficeAccounts";
import AuthLayout from "@/layouts/authentication/AuthLayout";
import { MEMBER_ADMIN_ACCESS } from "@/util/defines/common";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts back office", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthLayout access={MEMBER_ADMIN_ACCESS}><BackofficeAccounts /></AuthLayout>;
}
