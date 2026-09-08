"use client";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { SUPPORT_ACCESS } from "@/util/defines/common";
import styles from "./support.module.scss";
const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Loading your reports…</p> });

export default function HelpSection({ currentUser }) {
  return <div className="tab-content-wrapper"><div className={`tab-body ${styles.helpSection}`}>
    <header><h2>Help & reports</h2><p>Something isn’t working? Send a report and follow up with our team here.</p></header>
    <nav className={styles.quickLinks} aria-label="Account help"><a href="/user#settings">Membership & billing</a><a href="/user#tickets">Your tickets</a><a href="/contact">Contact the society</a>{currentUser.status === "active" && currentUser.roles?.some((role) => SUPPORT_ACCESS.includes(role)) && <a href="/user/support">Support inbox</a>}</nav>
    <div className={styles.embedded}><SupportDesk /></div>
  </div></div>;
}
HelpSection.propTypes = { currentUser: PropTypes.object.isRequired };
