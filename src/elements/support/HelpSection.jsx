"use client";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { SUPPORT_ACCESS } from "@/util/defines/common";
import styles from "./support.module.scss";
const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Loading your reports…</p> });

export default function HelpSection({ currentUser }) {
  return <div className="tab-content-wrapper"><div className={`tab-body ${styles.helpSection}`}>
    <header><h2>Help & recommendations</h2><p>Report a problem or share an idea to improve the society. Follow up with our team here.</p></header>
    <div className={styles.embedded}><SupportDesk /></div>
  </div></div>;
}
HelpSection.propTypes = { currentUser: PropTypes.object.isRequired };
