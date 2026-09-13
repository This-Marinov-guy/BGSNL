import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_2 } from "@/util/defines/common";
import EditInternship from "@/screens/userActions/EditInternship";

export const metadata = {
  title: "Edit Internship",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_2}>
      <EditInternship />
    </AuthLayout>
  );
}
