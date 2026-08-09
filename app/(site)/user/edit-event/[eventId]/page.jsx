import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_4 } from "@/util/defines/common";
import EditEvent from "@/screens/userActions/EditEvent";

export const metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_4}>
      <EditEvent />
    </AuthLayout>
  );
}
