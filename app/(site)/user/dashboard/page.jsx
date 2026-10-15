import AuthLayout from "@/layouts/authentication/AuthLayout";
import AdministrationHome from "@/screens/userActions/AdministrationHome";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout><AdministrationHome /></AuthLayout>; }
