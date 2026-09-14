import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_4 } from "@/util/defines/common";
import AddEvent from "@/screens/userActions/AddEvent";

export const metadata = {
  title: "Add Event",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_4}>
      <AddEvent />
    </AuthLayout>
  );
}
