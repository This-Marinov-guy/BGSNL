import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const { internshipId } = await params;
  redirect(`/user/dashboard/internships?edit=${encodeURIComponent(internshipId)}`);
}
