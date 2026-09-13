import { redirect } from "next/navigation";
export default async function Page({ params, searchParams }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams || {})) {
    for (const item of Array.isArray(value) ? value : [value]) if (item != null) query.append(key, item);
  }
  redirect(`/user/dashboard/internships/${encodeURIComponent((await params).internshipId)}/edit` + (query.size ? `?${query}` : ""));
}
