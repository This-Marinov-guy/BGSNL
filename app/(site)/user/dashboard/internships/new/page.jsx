import { redirect } from "next/navigation";

export default function Page() {
  redirect("/user/dashboard/internships?edit=new");
}
