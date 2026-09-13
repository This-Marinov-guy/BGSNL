import AuthLayout from "@/layouts/authentication/AuthLayout";
import { SUPPORT_ACCESS } from "@/util/defines/common";
import SupportInbox from "@/elements/support/SupportInbox";
export const dynamic = "force-dynamic";
export const metadata = { title: "Support inbox", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout access={SUPPORT_ACCESS}><SupportInbox /></AuthLayout>; }
