import AuthLayout from "@/layouts/authentication/AuthLayout";
import StatisticsDashboard from "@/screens/userActions/StatisticsDashboard";
import { DASHBOARD_ACCESS } from "@/util/defines/common";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event metrics", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthLayout access={DASHBOARD_ACCESS}><StatisticsDashboard kind="events" /></AuthLayout>;
}
