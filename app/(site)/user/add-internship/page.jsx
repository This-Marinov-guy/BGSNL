import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_1 } from "@/util/defines/common";
import AddInternship from "@/screens/userActions/AddInternship";

export const metadata = {
  title: "Add Internship",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_1}>
      <AddInternship />
    </AuthLayout>
  );
}
