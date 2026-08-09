import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_4 } from "@/util/defines/common";
import CheckTicket from "@/screens/redirects/CheckTicket";

export const metadata = {
  title: "Check Guest List",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_4}>
      <CheckTicket />
    </AuthLayout>
  );
}
