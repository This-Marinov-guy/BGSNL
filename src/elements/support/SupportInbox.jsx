"use client";
import dynamic from "next/dynamic";
import HeaderTwo from "@/component/header/HeaderTwo";
import styles from "./support.module.scss";
const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Loading support inbox…</p> });
export default function SupportInbox() {
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" /><main className={`container user-workspace-page ${styles.inboxPage}`}>
    <header><a href="/user#help">← Account help</a><h1>Website support</h1><p>Reply to reports, follow up with visitors and keep each conversation’s status up to date.</p></header>
    <div className={styles.embedded}><SupportDesk staff /></div>
  </main></>;
}
