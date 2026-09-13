"use client";

import { useState } from "react";
import GlobalBackground from "../component/common/GlobalBackground";
import StaticHeaderLogo from "../component/header/StaticHeaderLogo";
import styles from "./Maintenance.module.scss";

export default function Maintenance() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.location.reload();
  };

  return (
    <div className={styles.page}>
      <GlobalBackground initiallyRevealed />
      <StaticHeaderLogo />
      <main className={styles.content} aria-labelledby="maintenance-title">
        <h1 id="maintenance-title" className="page-breadcrumb__title archive">We’ll be back soon.</h1>
        <p className={styles.description}>
          We’re updating the Bulgarian Society website.
          Thanks for your patience while we get everything ready.
        </p>
        <button className={styles.refresh} type="button" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh page"}
        </button>
        <p className={styles.note} role="status">
          {refreshing ? "Checking if the website is ready…" : "Please check back in a little while."}
        </p>
      </main>
      <footer className={styles.footer}>
        <p>Need to reach us in the meantime?</p>
        <div className={styles.links}>
          <a href="mailto:info@bulgariansociety.nl">Email us</a>
          <a href="https://www.instagram.com/bulgariansociety.netherlands/" target="_blank" rel="noopener noreferrer">Instagram<span className={styles.srOnly}> (opens in a new tab)</span></a>
        </div>
      </footer>
    </div>
  );
}
