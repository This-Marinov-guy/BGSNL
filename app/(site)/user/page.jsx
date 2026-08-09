import AuthLayout from "@/layouts/authentication/AuthLayout";
import User from "@/screens/authentication/User";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";


export const metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthLayout>
      <User />
    </AuthLayout>
  );
}
