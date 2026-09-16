"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import HeaderTwo from "@/component/header/HeaderTwo";
import { FiArrowLeft } from "@/elements/ui/icons/IconlyIcons";
import administrationStyles from "@/screens/userActions/administration.module.scss";
import styles from "./support.module.scss";

const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Loading support inbox…</p> });

export default function SupportInbox() {
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page event-admin-page ${styles.inboxPage}`}>
      <nav className={administrationStyles.views} aria-label="Support administration">
        <Link className={administrationStyles.backLink} href="/user/dashboard" aria-label="Back to administration">
          <FiArrowLeft size={24} aria-hidden />
          <span>Administration</span>
        </Link>
      </nav>
      <header className="event-workspace-heading event-dashboard-heading">
        <div>
          <h1>Support tickets</h1>
          <p>Reply to reports, follow up with visitors and keep each conversation’s status up to date.</p>
        </div>
      </header>
      <div className={styles.embedded}><SupportDesk staff /></div>
    </main>
  </>;
}
