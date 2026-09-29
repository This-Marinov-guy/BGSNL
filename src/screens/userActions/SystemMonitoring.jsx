"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import HeaderTwo from "@/component/header/HeaderTwo";
import { FiArrowLeft } from "@/elements/ui/icons/IconlyIcons";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./system-monitoring.module.scss";

const total = (record) => Object.values(record || {}).reduce((sum, value) => sum + Number(value || 0), 0);
const label = (value) => String(value || "Other").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function Traffic({ title, count, values }) {
  const points = (values || []).map((item) => Number(item.count || 0));
  const max = Math.max(1, ...points);
  return <section className={styles.metric} aria-label={title}>
    <h3>{title}</h3><strong>{count.toLocaleString()}</strong><p>Last 24 hours</p>
    {points.length > 0 && <div className={styles.bars} role="img" aria-label={`${title} by hour`}>
      {points.map((value, index) => <span key={values[index].hour || index} style={{ height: `${Math.max(4, value / max * 100)}%` }} title={`${value} at ${values[index].hour}`} />)}
    </div>}
  </section>;
}
Traffic.propTypes = { title: PropTypes.string.isRequired, count: PropTypes.number.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({ hour: PropTypes.string, count: PropTypes.number })).isRequired };

function Breakdown({ title, values }) {
  return <section className={styles.metric}><h3>{title}</h3>
    {total(values) ? <dl className={styles.breakdown}>{Object.entries(values).sort((a, b) => b[1] - a[1]).map(([key, value]) =>
      <div key={key}><dt>{label(key)}</dt><dd>{Number(value).toLocaleString()}</dd></div>)}</dl> :
      <p>No records in the last 24 hours.</p>}</section>;
}
Breakdown.propTypes = { title: PropTypes.string.isRequired, values: PropTypes.objectOf(PropTypes.number).isRequired };

export default function SystemMonitoring() {
  const { sendRequest } = useHttpClient();
  const [snapshot, setSnapshot] = useState(null);
  const [state, setState] = useState("loading");
  const [tab, setTab] = useState("overview");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobPage, setJobPage] = useState(1);
  const [jobs, setJobs] = useState(null);
  const [jobsState, setJobsState] = useState("idle");
  const [jobsRefresh, setJobsRefresh] = useState(0);
  const load = useCallback(async (signal) => {
    setState("loading");
    const result = await sendRequest("monitoring/overview", "GET", null, {}, false, false, { signal });
    if (signal?.aborted) return;
    if (result) { setSnapshot(result); setState("ready"); }
    else setState("error");
  }, [sendRequest]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  const loadJobs = useCallback(async (signal) => {
    setJobsState("loading");
    const result = await sendRequest(`monitoring/jobs?status=${jobFilter}&page=${jobPage}`, "GET", null, {}, false, false, { signal });
    if (signal?.aborted) return;
    if (result) { setJobs(result); setJobsState("ready"); }
    else setJobsState("error");
  }, [sendRequest, jobFilter, jobPage]);
  useEffect(() => {
    if (tab !== "jobs") return undefined;
    const controller = new AbortController();
    loadJobs(controller.signal);
    return () => controller.abort();
  }, [tab, loadJobs, jobsRefresh]);

  const openJobs = (status = "all") => { setJobFilter(status); setJobPage(1); setTab("jobs"); };
  const refresh = () => { load(); if (tab === "jobs") setJobsRefresh((value) => value + 1); };
  const switchTabWithArrow = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = tab === "overview" ? "jobs" : "overview";
    setTab(nextTab);
    document.getElementById(`monitoring-${nextTab}-tab`)?.focus();
  };

  const axiom = snapshot?.axiom;
  const web = axiom?.web;
  const operations = axiom?.operations;
  const integrations = axiom?.integrations;
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page}`}>
      <nav className={styles.back}><Link href="/user/dashboard"><FiArrowLeft aria-hidden="true" />Administration</Link></nav>
      <header className={styles.heading}><div><h1>System manager</h1>
        <p>Background jobs, Axiom activity and live service checks.</p></div>
        <button type="button" onClick={refresh} disabled={state === "loading"}>Refresh checks</button></header>
      {state === "loading" && !snapshot && <LoadingSkeleton label="Checking systems" variant="cards" count={4} />}
      {state === "error" && <LoadErrorBanner message="Monitoring could not be loaded." onRetry={refresh} />}
      {snapshot && <>
        <p className={styles.checked}>Checked {new Date(snapshot.checkedAt).toLocaleString()} · Axiom {axiom.status}
          {!axiom.ingestionEnabled && " · ingestion disabled in this environment"}</p>
        {snapshot.jobs?.available && snapshot.jobs.counts.failed > 0 &&
          <section className={styles.jobAlert} aria-label="Failed jobs" role="alert">
            <div><strong>{snapshot.jobs.counts.failed} failed {snapshot.jobs.counts.failed === 1 ? "job" : "jobs"}</strong>
              <p>Background jobs need attention.</p></div>
            <button type="button" onClick={() => openJobs("failed")}>View failed jobs</button>
          </section>}
        <div className={styles.tabs} role="tablist" aria-label="System monitoring sections" onKeyDown={switchTabWithArrow}>
          <button id="monitoring-overview-tab" type="button" role="tab" aria-controls="monitoring-overview-panel"
            aria-selected={tab === "overview"} tabIndex={tab === "overview" ? 0 : -1} onClick={() => setTab("overview")}>Overview</button>
          <button id="monitoring-jobs-tab" type="button" role="tab" aria-controls="monitoring-jobs-panel"
            aria-selected={tab === "jobs"} tabIndex={tab === "jobs" ? 0 : -1} onClick={() => setTab("jobs")}>All jobs</button>
        </div>
        {snapshot.jobs?.available && Object.values(snapshot.jobs.sources).some((available) => !available) &&
          <p role="status" className={styles.notice}>One job source is unavailable. Failed-job counts may be incomplete.</p>}
        {snapshot.jobs && !snapshot.jobs.available && <p role="status" className={styles.notice}>Job counts are temporarily unavailable.</p>}
        {tab === "jobs" ? <section id="monitoring-jobs-panel" role="tabpanel" aria-labelledby="monitoring-jobs-tab" className={styles.jobsPanel}>
          <div className={styles.jobsHeading}><div><h2>Background jobs</h2><p>Marketing-email capture, spreadsheet sync, scheduled work, mail dispatch, and in-process Sheets jobs. Completed jobs remain for one day; failed jobs for seven days.</p></div>
            <button type="button" onClick={() => setJobsRefresh((value) => value + 1)} disabled={jobsState === "loading"}>Refresh jobs</button></div>
          <p className={styles.jobsNote}>Browse the latest 1,000 retained jobs. Domakin Mailer manages delivery jobs after BGSNL hands them off.</p>
          {jobs?.sources && Object.values(jobs.sources).some((available) => !available) &&
            <p role="status" className={styles.notice}>One job source is unavailable. Counts and rows may be incomplete.</p>}
          <div className={styles.jobFilters} aria-label="Filter jobs by status">
            {["all", "failed", "pending", "completed"].map((filter) => <button key={filter} type="button"
              aria-pressed={jobFilter === filter} onClick={() => { setJobFilter(filter); setJobPage(1); }}>
              {filter === "all" ? "All" : label(filter)}
              {jobs?.counts && <span>{filter === "all" ? total(jobs.counts) : jobs.counts[filter]}</span>}
            </button>)}
          </div>
          {jobsState === "loading" && <LoadingSkeleton label="Loading jobs" count={4} />}
          {jobsState === "error" && <LoadErrorBanner message="Jobs could not be loaded." onRetry={() => setJobsRefresh(value => value + 1)} />}
          {jobsState === "ready" && jobs && (jobs.items.length ? <>
            <div className={styles.jobTableScroll}><table className={styles.jobTable}>
              <thead><tr><th scope="col">Job</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Created</th><th scope="col">Finished</th><th scope="col">Failure</th></tr></thead>
              <tbody>{jobs.items.map((job, index) => <tr key={`${job.id || job.name}-${index}`}>
                <td><strong>{label(job.name)}</strong><small>{label(job.source)}{job.id ? ` · #${job.id}` : ""}</small></td>
                <td><span className={`${styles.jobStatus} ${styles[job.status]}`}>{job.status === "pending" ? label(job.state) : label(job.status)}</span></td>
                <td>{job.attempts} / {job.maxAttempts}</td>
                <td>{job.createdAt ? new Date(job.createdAt).toLocaleString() : "—"}</td>
                <td>{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : "—"}</td>
                <td>{job.status === "failed" ? job.errorName || "See logs" : "—"}</td>
              </tr>)}</tbody>
            </table></div>
            <div className={styles.jobPagination}><span>Page {jobs.page} · {jobs.total.toLocaleString()} {jobFilter === "all" ? "jobs" : `${jobFilter} jobs`}</span>
              <div><button type="button" disabled={jobsState === "loading" || jobPage <= 1} onClick={() => setJobPage((page) => page - 1)}>Previous</button>
                <button type="button" disabled={jobsState === "loading" || !jobs.hasMore} onClick={() => setJobPage((page) => page + 1)}>Next</button></div></div>
          </> : <p>No {jobFilter === "all" ? "jobs" : jobFilter + " jobs"} in the retained queue.</p>)}
        </section> : <div id="monitoring-overview-panel" role="tabpanel" aria-labelledby="monitoring-overview-tab">
        {axiom.message && <p role="status" className={styles.notice}>{axiom.message}</p>}
        <div className={styles.twoColumns}>
          <section className={styles.group}><h2>Website</h2><p>Dataset: {axiom.datasets.web}</p>
            {web ? <div className={styles.metrics}>
              <Traffic title="Page views" count={web.byType.page_view || 0} values={web.hourly} />
              <Breakdown title="Errors" values={Object.fromEntries(Object.entries(web.byType).filter(([type]) => type !== "page_view"))} />
            </div> : <p>Website logs are unavailable.</p>}</section>
          <section className={styles.group}><h2>Operations</h2><p>Dataset: {axiom.datasets.operations}</p>
            {operations ? <div className={styles.metrics}>
              <Traffic title="API requests" count={operations.byLevel.info || 0} values={operations.hourly} />
              <Breakdown title="Errors by source" values={operations.errorSources} />
            </div> : <p>Operations logs are unavailable.</p>}</section>
        </div>
        <section className={styles.health}><h2>Integrations</h2><p>Dataset: {axiom.datasets.integrations}</p>
          {integrations ? <div className={styles.services}>{integrations.length ? integrations.map((entry) =>
            <article key={`${entry.provider}-${entry.level}`} className={styles.service}><h3>{label(entry.provider)}</h3>
              <p>{label(entry.level)} · {entry.count.toLocaleString()} events in 24 hours</p></article>) :
            <p>No integration events in the last 24 hours.</p>}</div> : <p>Integration logs are unavailable.</p>}
        </section>
        <section className={styles.health}><h2>Service health</h2>
          <div className={styles.services}>{snapshot.services.map((service) => <article key={service.name} className={styles.service}>
            <div><h3>{service.name}</h3><span className={`${styles.status} ${styles[service.status]}`}>{service.status}</span></div>
            <p>{service.detail || `Responded in ${service.latencyMs} ms`}</p>
          </article>)}</div>
        </section>
        </div>}
      </>}
    </main></>;
}
