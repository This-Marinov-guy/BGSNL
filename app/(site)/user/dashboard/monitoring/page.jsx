import AuthLayout from "@/layouts/authentication/AuthLayout";
import { MONITORING_ACCESS } from "@/util/defines/common";
import SystemMonitoring from "@/screens/userActions/SystemMonitoring";

export const dynamic = "force-dynamic";
export const metadata = { title: "System manager", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout access={MONITORING_ACCESS}><SystemMonitoring /></AuthLayout>; }
