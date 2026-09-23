"use client";
import dynamic from "next/dynamic";
import UserTabHeader from "@/elements/ui/tabs/UserTabHeader";
import styles from "./support.module.scss";
const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Loading your reports…</p> });

export default function HelpSection() {
  return <div className="tab-content-wrapper"><UserTabHeader title="Help & recommendations" /><div className={`tab-body ${styles.helpSection}`}>
    <header><p>Report a problem or share an idea to improve the society. Follow up with our team here.</p></header>
    <div className={styles.embedded}><SupportDesk /></div>
  </div></div>;
}
