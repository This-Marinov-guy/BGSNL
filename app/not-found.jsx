import Error404 from "@/screens/Error404";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <Error404 />;
}
