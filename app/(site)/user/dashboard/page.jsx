import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_4 } from "@/util/defines/common";
import EventDashboard from "@/screens/userActions/EventDashboard";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";


export const metadata = {
  title: "Event Dashboard",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout access={ACCESS_4}>
      <EventDashboard />
    </AuthLayout>
  );
}
