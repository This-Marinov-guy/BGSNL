import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_2 } from "@/util/defines/common";
import InternshipsDashboard from "@/screens/userActions/InternshipsDashboard";

export const metadata = {
  title: "Internships Dashboard",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_2}>
      <InternshipsDashboard />
    </AuthLayout>
  );
}
