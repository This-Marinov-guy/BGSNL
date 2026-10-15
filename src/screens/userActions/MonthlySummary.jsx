"use client";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";

import { useCallback, useEffect, useState } from "react";
import HeaderTwo from "@/component/header/HeaderTwo";
import DashboardNavigation from "./DashboardNavigation";
import workspace from "./dashboard-workspace.module.scss";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { IconlyRotate } from "@/elements/ui/icons/IconlyIcons";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import styles from "./monthly-summary.module.scss";

const currentMonth = () => {
  const parts = new globalThis.Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find(part => part.type === "year").value}-${parts.find(part => part.type === "month").value}`;
};

const request = async (month, signal) => {
  const timeout = AbortSignal.timeout(20000);
  let response;
  try {
    response = await browserFetch(`/api/dashboard/monthly-summary/${month}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch { throw new Error("We could not load the monthly email preview. Try again."); }
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "The monthly email preview is unavailable. Try again.");
  return body;
};

export default function MonthlySummary() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async signal => {
    setLoading(true); setError("");
    try {
      const result = await request(month, signal);
      if (!signal?.aborted) setSummary(result);
    } catch (failure) { if (!signal?.aborted) setError(failure.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [month]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${workspace.page} ${styles.page}`}>
      <DashboardNavigation />
      <header className={`event-workspace-heading ${styles.header}`}><div><h1>Monthly summary</h1></div>
        <div className="rn-form-group"><label htmlFor="summary-month">Month</label><input id="summary-month" type="month" value={month} min="2000-01" max="2099-12" onChange={event => {
          if (event.target.value) { setMonth(event.target.value); setSummary(null); }
        }} /></div></header>
      {loading && !summary && <LoadingSkeleton label="Loading monthly email preview" count={4} />}
      {error && <LoadErrorBanner message={error} onRetry={() => load()} disabled={loading} />}
      {summary && <>
        <section className={styles.overview} aria-label="Monthly email schedule"><div className={styles.overviewHeader}>
          <h2>{summary.label}</h2>
          <button type="button" className={`${styles.control} ${styles.refreshButton}`} onClick={() => load()} disabled={loading}
            aria-label="Refresh preview" aria-busy={loading} title="Refresh preview">
            <IconlyRotate aria-hidden="true" size="1.25rem" />
          </button>
        </div>
          <p>Scheduled for {formatDisplayDateTime(summary.dueAt, summary.timeZone)} (Amsterdam time).</p>
          <p>{summary.recipients.total} eligible recipients now: {summary.recipients.alumni} alumni and {summary.recipients.internal} additional internal contacts. Duplicate addresses receive one email.</p>
          <p>{summary.counts.events} events · {summary.counts.members} new members · {summary.counts.alumni} new alumni</p>
          <p className={styles.hint}>This is a live preview. Events, articles, counts and recipients are calculated again when the email sends. Delivery history is in Domakin Mailer.</p>
          {summary.recipients.total === 0 && <p role="status">No one is eligible right now. Check the subscriber settings before this month’s send.</p>}
        </section>
        <section className={styles.preview}><h2>Live email preview</h2><p>{summary.preview.subject}</p>
          <iframe title="Monthly supporter email preview" sandbox="" referrerPolicy="no-referrer" srcDoc={summary.preview.html} />
        </section>
      </>}
    </main>
  </>;
}
