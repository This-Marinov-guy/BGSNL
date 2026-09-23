import { redirect } from "next/navigation";

export const metadata = {
  title: "Ticket Scanner",
  robots: { index: false, follow: false },
};

// Keep shared and previously printed QR links working after moving the scanner
// into its dedicated tool page.
export default async function Page({ searchParams }) {
  const query = new URLSearchParams(await searchParams);
  redirect(`/user/dashboard/ticket-scanner${query.size ? `?${query}` : ""}`);
}
