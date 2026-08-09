import Error404 from "@/screens/Error404";

// The old SPA had an explicit /404 route that RegionLayout redirected to.
// Kept so existing inbound links keep working; app/not-found.jsx handles the
// real 404s.
export const metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Error404 />;
}
