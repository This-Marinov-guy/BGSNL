import BackofficeAccounts from "@/elements/backoffice/BackofficeAccounts";
import AuthLayout from "@/layouts/authentication/AuthLayout";
import { MEMBER_ADMIN_ACCESS } from "@/util/defines/common";
import { redirect } from "next/navigation";
import { statisticsRedirectPath } from "@/util/administration.mjs";
import PropTypes from "prop-types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts back office", robots: { index: false, follow: false } };

export default async function Page({ searchParams }) {
  const query = await searchParams;
  if (query?.view === "statistics") redirect(statisticsRedirectPath("member", query));
  return <AuthLayout access={MEMBER_ADMIN_ACCESS}><BackofficeAccounts /></AuthLayout>;
}

Page.propTypes = { searchParams: PropTypes.object };
