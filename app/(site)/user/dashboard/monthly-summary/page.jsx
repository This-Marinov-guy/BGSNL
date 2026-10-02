import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ALL_MEMBER_REGIONS_ACCESS } from "@/util/defines/common";
import MonthlySummary from "@/screens/userActions/MonthlySummary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Monthly summary", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout access={ALL_MEMBER_REGIONS_ACCESS}><MonthlySummary /></AuthLayout>; }
