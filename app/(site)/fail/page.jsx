import Fail from "@/screens/redirects/Fail";

export const metadata = {
  title: "Payment Failed",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Fail />
  );
}
