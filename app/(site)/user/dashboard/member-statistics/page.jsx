import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_3 } from "@/util/defines/common";
import MembersDashboard from "@/screens/userActions/MembersDashboard";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";


export const metadata = {
  title: "Members",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_3}>
      <MembersDashboard />
    </AuthLayout>
  );
}
