"use client";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "@/component/header/HeaderTwo";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { IconlyRotate } from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./system-monitoring.module.scss";
import { scrollToListStart } from "@/util/functions/pagination-scroll.mjs";

const total = (record) => Object.values(record || {}).reduce((sum, value) => sum + Number(value || 0), 0);
const label = (value) => String(value || "Other").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const euro = (cents) => new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
const paymentType = (value) => value === "member_revenue_transfer" ? "Member revenue transfer" : label(value);
const paymentReason = (value) => value === "waiting_stripe_funds" ? "Waiting for Stripe funds" : label(value);

function Traffic({ title, count, values }) {
  const points = (values || []).map((item) => Number(item.count || 0));
  const max = Math.max(1, ...points);
  return <section className={styles.metric} aria-label={title}>
    <h5>{title}</h5><strong>{count.toLocaleString()}</strong><p>Last 24 hours</p>
    {points.length > 0 && <div className={styles.bars} role="img" aria-label={`${title} by hour`}>
      {points.map((value, index) => <span key={values[index].hour || index} style={{ height: `${Math.max(4, value / max * 100)}%` }} title={`${value} at ${values[index].hour}`} />)}
    </div>}
  </section>;
}
Traffic.propTypes = { title: PropTypes.string.isRequired, count: PropTypes.number.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({ hour: PropTypes.string, count: PropTypes.number })).isRequired };

function Breakdown({ title, values }) {
  return <section className={styles.metric}><h5>{title}</h5>
    {total(values) ? <dl className={styles.breakdown}>{Object.entries(values).sort((a, b) => b[1] - a[1]).map(([key, value]) =>
      <div key={key}><dt>{label(key)}</dt><dd>{Number(value).toLocaleString()}</dd></div>)}</dl> :
      <p>No records in the last 24 hours.</p>}</section>;
}
Breakdown.propTypes = { title: PropTypes.string.isRequired, values: PropTypes.objectOf(PropTypes.number).isRequired };

function LastCheck({ checkedAt }) {
  const validCheck = checkedAt && !Number.isNaN(Date.parse(checkedAt));
  return <p className={styles.lastCheck}>Last check: {validCheck ? <time dateTime={checkedAt}>{formatDisplayDateTime(checkedAt)}</time> : "—"}</p>;
}
LastCheck.propTypes = { checkedAt: PropTypes.string };

function SelectableCard({ id, detailsId, name, status, tone, summary, progress, selected, onSelect }) {
  return <article className={styles.service} aria-labelledby={`${id}-title`}>
    <button id={`${id}-button`} className={styles.serviceToggle} type="button" aria-expanded={selected} aria-controls={detailsId} onClick={onSelect}>
      <span className={styles.serviceHeader}><span id={`${id}-title`} className={styles.serviceName}>{name}</span><span className={`${styles.status} ${styles[tone]}`}>{status}</span></span>
      <span className={styles.serviceSummary}>{summary}</span>
      {progress !== null && progress !== undefined && <span className={styles.cardProgress} aria-hidden="true">
        <span className={progress >= 100 ? styles.progressOver : progress >= 80 ? styles.progressNear : ""}
          style={{ width: `${Math.min(100, progress)}%` }} /></span>}
    </button>
  </article>;
}
SelectableCard.propTypes = { id: PropTypes.string.isRequired, detailsId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired, status: PropTypes.string.isRequired, tone: PropTypes.string.isRequired,
  summary: PropTypes.node.isRequired, progress: PropTypes.number, selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired };

function DetailPanel({ id, name, status, tone, checkedAt, open, focusId, onClose, children }) {
  return <div id={id} className={`${styles.detailReveal} ${open ? styles.detailRevealOpen : ""}`}
    aria-hidden={!open} aria-labelledby={`${id}-title`}>
    <div className={styles.detailRevealInner}>
      {name && <section className={styles.detailSurface}>
        <div className={styles.detailHeader}>
          <div><h3 id={`${id}-title`} tabIndex={-1}>{name}</h3><span className={`${styles.status} ${styles[tone]}`}>{status}</span></div>
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => {
            onClose();
            document.getElementById(focusId)?.focus();
          }}>Close details</button>
        </div>
        <div className={styles.detailContent} key={name}>{children}</div>
        <LastCheck checkedAt={checkedAt} />
      </section>}
    </div>
  </div>;
}
DetailPanel.propTypes = { id: PropTypes.string.isRequired, name: PropTypes.string,
  status: PropTypes.string, tone: PropTypes.string, checkedAt: PropTypes.string,
  open: PropTypes.bool.isRequired, focusId: PropTypes.string, onClose: PropTypes.func.isRequired,
  children: PropTypes.node };

const cardId = (prefix, name) => `${prefix}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

const revealDetails = (id) => {
  requestAnimationFrame(() => {
    document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  });
};

const formatQuota = (value, unit) => {
  if (value === null || value === undefined) return "—";
  if (unit === "bytes") {
    const divisor = value >= 1024 ** 3 ? 1024 ** 3 : value >= 1024 ** 2 ? 1024 ** 2 : 1024;
    const suffix = divisor === 1024 ** 3 ? "GB" : divisor === 1024 ** 2 ? "MB" : "KB";
    return `${(value / divisor).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${suffix}`;
  }
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
};

function quotaPresentation(quota) {
  const first = quota.metrics?.[0];
  const progress = first?.limit > 0 && first?.used !== null ? Math.round(first.used / first.limit * 100) : null;
  const summary = first ? `${formatQuota(first.used, first.unit)}${first.limit !== null ? ` of ${formatQuota(first.limit, first.unit)} (${progress}%)` : ""} · ${first.period}` : quota.detail;
  const confirmedProgress = Math.max(0, ...(quota.metrics || []).filter((metric) => metric.limitType !== "reference" && metric.limit > 0 && metric.used !== null)
    .map((metric) => metric.used / metric.limit * 100));
  const status = confirmedProgress >= 100 ? "Limit reached" : confirmedProgress >= 80 ? "Near limit" :
    quota.status === "ready" ? "Tracking" : quota.status === "partial" ? "Partial" :
    quota.status === "not configured" ? "Not configured" : "Unavailable";
  const tone = confirmedProgress >= 100 ? "unhealthy" : confirmedProgress >= 80 ? "unverified" :
    quota.status === "ready" ? "healthy" : "unverified";
  return { status, tone, summary, progress };
}

function quotaCardSummary(quota, fallback) {
  const metrics = quota.metrics || [];
  if (quota.name === "Mailtrap" && metrics.length) return <span className={styles.quotaCardRows}>
    {metrics.map((metric) => <span key={metric.label}>
      {metric.label.startsWith("Monthly") ? "Month" : "Today"}: {metric.used === null ? "—" : Number(metric.used).toLocaleString()}
      {metric.limit !== null ? ` / ${formatQuota(metric.limit, metric.unit)}` : " · limit unavailable"}
      {metric.limitType === "reference" && metric.limit !== null ? " (reference)" : ""}
    </span>)}
  </span>;
  if (quota.name === "WordPress" && metrics[0]) {
    const metric = metrics[0];
    if (metric.limit === null || metric.used === null) return `${fallback} · Available storage not reported`;
    return `${formatQuota(Math.max(0, metric.limit - metric.used), metric.unit)} available · ${formatQuota(metric.used, metric.unit)} used of ${formatQuota(metric.limit, metric.unit)}`;
  }
  return fallback;
}

function QuotaDetails({ quota }) {
  return <>
    <p>{quota.detail}</p>
    {quota.metrics?.map((metric, index) => {
      const percent = metric.limit > 0 && metric.used !== null ? Math.min(100, Math.round(metric.used / metric.limit * 100)) : null;
      return <div className={styles.quotaMetric} key={`${metric.label}-${index}`}>
        <div className={styles.quotaMetricHeading}><strong>{metric.label}</strong><span>{metric.period}</span></div>
        <p>{formatQuota(metric.used, metric.unit)}{metric.limit !== null ? ` / ${formatQuota(metric.limit, metric.unit)}` : ""}</p>
        {metric.limit !== null && metric.used !== null && <p className={styles.quotaAvailable}>
          {formatQuota(Math.max(0, metric.limit - metric.used), metric.unit)} available
        </p>}
        {percent !== null && <div className={styles.quotaTrack} role="progressbar" aria-label={`${quota.name} ${metric.label}`}
          aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span
            className={percent >= 100 ? styles.progressOver : percent >= 80 ? styles.progressNear : ""}
            style={{ width: `${percent}%` }} /></div>}
        {metric.limitType === "reference" && <small>Free-plan reference; account plan has not been verified.</small>}
      </div>;
    })}
  </>;
}
QuotaDetails.propTypes = { quota: PropTypes.object.isRequired };

function QuotaCard({ quota, selected, onSelect }) {
  const presentation = quotaPresentation(quota);
  return <SelectableCard id={cardId("quota", quota.name)} detailsId="quota-detail-panel" name={quota.name}
    {...presentation} summary={quotaCardSummary(quota, presentation.summary)}
    progress={quota.name === "Mailtrap" ? null : presentation.progress} selected={selected} onSelect={onSelect} />;
}
QuotaCard.propTypes = { quota: PropTypes.object.isRequired, selected: PropTypes.bool.isRequired, onSelect: PropTypes.func.isRequired };

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
  const [payments, setPayments] = useState(null);
  const [paymentsState, setPaymentsState] = useState("idle");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentsRefresh, setPaymentsRefresh] = useState(0);
  const [quotaSnapshot, setQuotaSnapshot] = useState(null);
  const [quotasState, setQuotasState] = useState("idle");
  const [quotasRefresh, setQuotasRefresh] = useState(0);
  const [expandedService, setExpandedService] = useState(null);
  const [expandedQuota, setExpandedQuota] = useState(null);
  const [lastService, setLastService] = useState(null);
  const [lastQuota, setLastQuota] = useState(null);
  const jobsStartRef = useRef(null);
  const paymentsStartRef = useRef(null);
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
    let result;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      let failureStatus = null;
      result = await sendRequest(`monitoring/jobs?status=${jobFilter}&page=${jobPage}`, "GET", null, {}, false, false,
        { signal, timeout: 10000, onFailure: ({ status }) => { failureStatus = status; } });
      if (signal?.aborted) return;
      if (result || (failureStatus !== null && failureStatus < 500) || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      if (signal?.aborted) return;
    }
    if (result) { setJobs(result); setJobsState("ready"); }
    else setJobsState("error");
  }, [sendRequest, jobFilter, jobPage]);
  useEffect(() => {
    if (tab !== "jobs") return undefined;
    const controller = new AbortController();
    loadJobs(controller.signal);
    return () => controller.abort();
  }, [tab, loadJobs, jobsRefresh]);

  const loadPayments = useCallback(async (signal) => {
    setPaymentsState("loading");
    const result = await sendRequest(`monitoring/payments?page=${paymentPage}`, "GET", null, {}, false, false, { signal });
    if (signal?.aborted) return;
    if (result?.items) { setPayments(result); setPaymentsState("ready"); }
    else setPaymentsState("error");
  }, [sendRequest, paymentPage]);
  useEffect(() => {
    if (tab !== "payments") return undefined;
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [tab, loadPayments, paymentsRefresh]);

  const loadQuotas = useCallback(async (signal, fresh = false) => {
    setQuotasState("loading");
    const result = await sendRequest(`monitoring/quotas${fresh ? "?refresh=1" : ""}`, "GET", null, {}, false, false, { signal });
    if (signal?.aborted) return;
    if (result?.quotas) { setQuotaSnapshot(result); setQuotasState("ready"); }
    else setQuotasState("error");
  }, [sendRequest]);
  useEffect(() => {
    if (tab !== "quotas") return undefined;
    const controller = new AbortController();
    loadQuotas(controller.signal, quotasRefresh > 0);
    return () => controller.abort();
  }, [tab, loadQuotas, quotasRefresh]);

  const openJobs = (status = "all") => { setJobFilter(status); setJobPage(1); setTab("jobs"); };
  const refresh = () => {
    if (tab === "quotas") setQuotasRefresh((value) => value + 1);
    else if (tab === "jobs") setJobsRefresh((value) => value + 1);
    else if (tab === "payments") setPaymentsRefresh((value) => value + 1);
    else load();
  };
  const switchTabWithArrow = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const tabs = ["overview", "payments", "quotas", "jobs"];
    const nextTab = tabs[(tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setTab(nextTab);
    document.getElementById(`monitoring-${nextTab}-tab`)?.focus();
  };

  const axiom = snapshot?.axiom;
  const web = axiom?.web;
  const operations = axiom?.operations;
  const integrations = axiom?.integrations;
  const selectedService = lastService === "Axiom" ? null : snapshot?.services?.find((service) => service.name === lastService);
  const selectedQuota = quotaSnapshot?.quotas?.find((quota) => quota.name === lastQuota);
  const selectService = (name) => {
    const opening = expandedService !== name;
    setLastService(name);
    setExpandedService(opening ? name : null);
    if (opening) revealDetails("service-detail-panel");
  };
  const selectQuota = (name) => {
    const opening = expandedQuota !== name;
    setLastQuota(name);
    setExpandedQuota(opening ? name : null);
    if (opening) revealDetails("quota-detail-panel");
  };
  const refreshing = tab === "quotas" ? quotasState === "loading" : tab === "jobs" ? jobsState === "loading" : tab === "payments" ? paymentsState === "loading" : state === "loading";
  const refreshLabel = tab === "quotas" ? "Refresh usage" : tab === "jobs" ? "Refresh jobs" : tab === "payments" ? "Refresh payments" : "Refresh checks";
  const jobsMatchSelection = jobs?.status === jobFilter && jobs?.page === jobPage;
  const paymentsMatchSelection = payments?.page === paymentPage;
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page} ${workspace.page}`}>
      <DashboardNavigation />
      <header className={`event-workspace-heading ${styles.heading}`}><div><h1>System manager</h1></div>
        <button className={styles.refreshButton} type="button" onClick={refresh} disabled={refreshing}
          aria-label={refreshLabel} aria-busy={refreshing} title={refreshLabel}><IconlyRotate aria-hidden="true" size="1.25rem" /></button></header>
      <>
        {snapshot?.jobs?.available && snapshot.jobs.counts.failed > 0 &&
          <section className={styles.jobAlert} aria-label="Failed jobs" role="alert">
            <div><strong>{snapshot.jobs.counts.failed} failed {snapshot.jobs.counts.failed === 1 ? "job" : "jobs"}</strong>
              <p>Background jobs need attention.</p></div>
            <button type="button" onClick={() => openJobs("failed")}>View failed jobs</button>
          </section>}
        <div className={styles.tabs} role="tablist" aria-label="System monitoring sections" onKeyDown={switchTabWithArrow}>
          <button id="monitoring-overview-tab" type="button" role="tab" aria-controls="monitoring-overview-panel"
            aria-selected={tab === "overview"} tabIndex={tab === "overview" ? 0 : -1} onClick={() => setTab("overview")}>Overview</button>
          <button id="monitoring-payments-tab" type="button" role="tab" aria-controls="monitoring-payments-panel"
            aria-selected={tab === "payments"} tabIndex={tab === "payments" ? 0 : -1} onClick={() => setTab("payments")}>Payments</button>
          <button id="monitoring-quotas-tab" type="button" role="tab" aria-controls="monitoring-quotas-panel"
            aria-selected={tab === "quotas"} tabIndex={tab === "quotas" ? 0 : -1} onClick={() => setTab("quotas")}>Usage</button>
          <button id="monitoring-jobs-tab" type="button" role="tab" aria-controls="monitoring-jobs-panel"
            aria-selected={tab === "jobs"} tabIndex={tab === "jobs" ? 0 : -1} onClick={() => setTab("jobs")}>All jobs</button>
        </div>
        {snapshot?.jobs?.available && Object.values(snapshot.jobs.sources).some((available) => !available) &&
          <p role="status" className={styles.notice}>One job source is unavailable. Failed-job counts may be incomplete.</p>}
        {snapshot?.jobs && !snapshot.jobs.available && <p role="status" className={styles.notice}>Job counts are temporarily unavailable.</p>}
        {tab === "payments" ? <section id="monitoring-payments-panel" role="tabpanel" aria-labelledby="monitoring-payments-tab" className={styles.jobsPanel} ref={paymentsStartRef}>
          <div className={styles.jobsHeading}><div><h2>Pending regional transfers</h2>
            <p>Shares from paid Member invoices waiting for funds in the BGSNL Stripe balance. Entries clear after Stripe confirms the transfer.</p></div></div>
          {(paymentsState === "idle" || paymentsState === "loading" && !paymentsMatchSelection) && <LoadingSkeleton label="Loading pending payments" count={4} />}
          {paymentsState === "error" && <LoadErrorBanner message={paymentsMatchSelection
            ? "Pending payments could not be refreshed. Showing the last loaded results." : "Pending payments could not be loaded. Try again."}
            onRetry={() => setPaymentsRefresh(value => value + 1)} />}
          {paymentsState === "loading" && paymentsMatchSelection && <p className={styles.refreshing} role="status">Refreshing pending payments…</p>}
          {paymentsMatchSelection && payments && (payments.items.length ? <>
            <p className={styles.paymentCount}>{payments.total.toLocaleString()} {payments.total === 1 ? "transfer" : "transfers"} waiting for Stripe funds</p>
            <div className={styles.jobTableScroll}><table className={`${styles.jobTable} ${styles.paymentTable}`}>
              <thead><tr><th scope="col">Invoice</th><th scope="col">Region</th><th scope="col">Amount</th><th scope="col">Reason</th><th scope="col">Invoice paid</th><th scope="col">Tracked since</th></tr></thead>
              <tbody>{payments.items.map((payment) => <tr key={payment.invoiceId}>
                <td><strong>{payment.invoiceId}</strong><small>{paymentType(payment.type)} · {payment.subscriptionId}</small></td>
                <td>{label(payment.region)}</td>
                <td className={styles.paymentAmount}>{euro(payment.amountCents)}</td>
                <td><span className={`${styles.jobStatus} ${styles.pending}`}>{paymentReason(payment.reason)}</span></td>
                <td>{payment.invoicePaidAt ? formatDisplayDateTime(payment.invoicePaidAt) : "—"}</td>
                <td>{payment.createdAt ? formatDisplayDateTime(payment.createdAt) : "—"}</td>
              </tr>)}</tbody>
            </table></div>
            <div className={styles.jobPagination}><span>Page {payments.page} · {payments.total.toLocaleString()} pending</span>
              <div><button type="button" disabled={paymentsState === "loading" || paymentPage <= 1}
                onClick={() => { scrollToListStart(paymentsStartRef); setPaymentPage(page => page - 1); }}>Previous</button>
                <button type="button" disabled={paymentsState === "loading" || !payments.hasMore}
                  onClick={() => { scrollToListStart(paymentsStartRef); setPaymentPage(page => page + 1); }}>Next</button></div></div>
          </> : <p className={styles.paymentEmpty}>No regional transfers are waiting for Stripe funds. Any new balance shortage will appear here and clear after its transfer succeeds.</p>)}
        </section> : tab === "jobs" ? <section id="monitoring-jobs-panel" role="tabpanel" aria-labelledby="monitoring-jobs-tab" className={styles.jobsPanel} ref={jobsStartRef}>
          <div className={styles.jobsHeading}><div><h2>Background jobs</h2><p>Marketing-email capture, spreadsheet sync, scheduled work, mail dispatch, and in-process Sheets jobs. Completed jobs remain for one day; failed jobs for seven days.</p></div>
            <button className={styles.refreshButton} type="button" onClick={() => setJobsRefresh((value) => value + 1)}
              disabled={jobsState === "loading"} aria-label="Refresh jobs" aria-busy={jobsState === "loading"}
              title="Refresh jobs"><IconlyRotate aria-hidden="true" size="1.25rem" /></button></div>
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
          {(jobsState === "idle" || (jobsState === "loading" && !jobsMatchSelection)) && <LoadingSkeleton label="Loading jobs" count={4} />}
          {jobsState === "error" && <LoadErrorBanner message={jobsMatchSelection
            ? "Jobs could not be refreshed. Showing the last loaded results." : "Jobs could not be loaded. Try again."}
            onRetry={() => setJobsRefresh(value => value + 1)} />}
          {jobsState === "loading" && jobsMatchSelection && <p className={styles.refreshing} role="status">Refreshing jobs…</p>}
          {jobsMatchSelection && jobs && (jobs.items.length ? <>
            <div className={styles.jobTableScroll}><table className={styles.jobTable}>
              <thead><tr><th scope="col">Job</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Created</th><th scope="col">Finished</th><th scope="col">Failure</th></tr></thead>
              <tbody>{jobs.items.map((job, index) => <tr key={`${job.id || job.name}-${index}`}>
                <td><strong>{label(job.name)}</strong><small>{label(job.source)}{job.id ? ` · #${job.id}` : ""}</small></td>
                <td><span className={`${styles.jobStatus} ${styles[job.status]}`}>{job.status === "pending" ? label(job.state) : label(job.status)}</span></td>
                <td>{job.attempts} / {job.maxAttempts}</td>
                <td>{job.createdAt ? formatDisplayDateTime(job.createdAt) : "—"}</td>
                <td>{job.finishedAt ? formatDisplayDateTime(job.finishedAt) : "—"}</td>
                <td>{job.status === "failed" ? job.errorName || "See logs" : "—"}</td>
              </tr>)}</tbody>
            </table></div>
            <div className={styles.jobPagination}><span>Page {jobs.page} · {jobs.total.toLocaleString()} {jobFilter === "all" ? "jobs" : `${jobFilter} jobs`}</span>
              <div><button type="button" disabled={jobsState === "loading" || jobPage <= 1} onClick={() => { scrollToListStart(jobsStartRef); setJobPage((page) => page - 1); }}>Previous</button>
                <button type="button" disabled={jobsState === "loading" || !jobs.hasMore} onClick={() => { scrollToListStart(jobsStartRef); setJobPage((page) => page + 1); }}>Next</button></div></div>
          </> : <p>No {jobFilter === "all" ? "jobs" : jobFilter + " jobs"} in the retained queue.</p>)}
        </section> : tab === "quotas" ? <section id="monitoring-quotas-panel" role="tabpanel" aria-labelledby="monitoring-quotas-tab" className={styles.health}>
          <h2>Usage</h2>
          <p className={styles.sectionNote}>Provider usage and available allowances. Reference limits are marked when the account plan cannot be verified.</p>
          {(quotasState === "idle" || quotasState === "loading") && !quotaSnapshot && <LoadingSkeleton label="Checking usage" variant="cards" count={5} />}
          {quotasState === "error" && <LoadErrorBanner message={quotaSnapshot
            ? "Usage could not be refreshed. Showing the last readings." : "Usage could not be loaded."}
            onRetry={() => setQuotasRefresh(value => value + 1)} />}
          {quotaSnapshot?.quotas?.length ? <>
            <DetailPanel id="quota-detail-panel" name={selectedQuota?.name}
              {...(selectedQuota ? quotaPresentation(selectedQuota) : {})}
              checkedAt={selectedQuota?.checkedAt} open={Boolean(expandedQuota && selectedQuota)}
              focusId={selectedQuota ? `${cardId("quota", selectedQuota.name)}-button` : ""}
              onClose={() => setExpandedQuota(null)}>
              {selectedQuota && <QuotaDetails quota={selectedQuota} />}
            </DetailPanel>
            <div className={styles.services}>
              {quotaSnapshot.quotas.map((quota) => <QuotaCard key={quota.name} quota={quota}
                selected={expandedQuota === quota.name} onSelect={() => selectQuota(quota.name)} />)}
            </div>
          </> : quotasState === "ready" ? <p>No provider usage was returned. Refresh to try again.</p> : null}
          {quotasState === "loading" && quotaSnapshot && <p className={styles.refreshing} role="status">Refreshing usage…</p>}
        </section> : <div id="monitoring-overview-panel" role="tabpanel" aria-labelledby="monitoring-overview-tab">
        {state === "loading" && !snapshot && <LoadingSkeleton label="Checking systems" variant="cards" count={4} />}
        {state === "error" && <LoadErrorBanner message="Monitoring could not be loaded." onRetry={() => load()} />}
        {snapshot && <section className={styles.health}><h2>Service health</h2>
          <DetailPanel id="service-detail-panel" name={lastService === "Axiom" ? "Axiom" : selectedService?.name}
            status={lastService === "Axiom" && axiom.status === "connected" ? "Healthy" : lastService === "Axiom" ? axiom.status : selectedService?.status}
            tone={lastService === "Axiom" ? axiom.status === "connected" ? "healthy" : ["degraded", "not configured"].includes(axiom.status) ? "unverified" : "unhealthy" : selectedService?.status}
            checkedAt={lastService === "Axiom" ? axiom.checkedAt || snapshot.checkedAt : selectedService?.checkedAt || snapshot.checkedAt}
            open={Boolean(expandedService && (lastService === "Axiom" || selectedService))}
            focusId={`${cardId("monitoring", lastService || "axiom")}-button`}
            onClose={() => setExpandedService(null)}>
            {lastService === "Axiom" ? <>
              {axiom.message && <div role="status" className={`${styles.notice} ${styles.axiomNotice}`}>{axiom.message}</div>}
              {axiom.ingestionEnabled === false && <p>Ingestion is disabled in this environment.</p>}
              <div className={styles.axiomDatasets}>
                <div className={styles.axiomDataset}><h4>Website</h4><p>Dataset: {axiom.datasets.web}</p>
                  {web ? <div className={styles.metrics}>
                    <Traffic title="Page views" count={web.byType.page_view || 0} values={web.hourly} />
                    <Breakdown title="Errors" values={Object.fromEntries(Object.entries(web.byType).filter(([type]) => type !== "page_view"))} />
                  </div> : <p>Website logs are unavailable.</p>}</div>
                <div className={styles.axiomDataset}><h4>Operations</h4><p>Dataset: {axiom.datasets.operations}</p>
                  {operations ? <div className={styles.metrics}>
                    <Traffic title="API requests" count={operations.byLevel.info || 0} values={operations.hourly} />
                    <Breakdown title="Errors by source" values={operations.errorSources} />
                  </div> : <p>Operations logs are unavailable.</p>}</div>
                <div className={styles.axiomDataset}><h4>Integrations</h4><p>Dataset: {axiom.datasets.integrations}</p>
                  {integrations ? integrations.length ? <ul className={styles.integrationEvents}>{integrations.map((entry) =>
                    <li key={`${entry.provider}-${entry.level}`}><strong>{label(entry.provider)}</strong><span>{label(entry.level)} · {entry.count.toLocaleString()} events in 24 hours</span></li>)}</ul> :
                    <p>No integration events in the last 24 hours.</p> : <p>Integration logs are unavailable.</p>}</div>
              </div>
            </> : selectedService && <dl className={styles.serviceFacts}><div><dt>Result</dt><dd>{selectedService.detail || "Probe succeeded"}</dd></div>
              <div><dt>Response time</dt><dd>{selectedService.latencyMs} ms</dd></div></dl>}
          </DetailPanel>
          <div className={styles.services}>
            <SelectableCard id="monitoring-axiom" detailsId="service-detail-panel" name="Axiom" status={axiom.status === "connected" ? "Healthy" : axiom.status}
              tone={axiom.status === "connected" ? "healthy" : ["degraded", "not configured"].includes(axiom.status) ? "unverified" : "unhealthy"}
              summary={axiom.message || "Website, operations, and integration logs"}
              selected={expandedService === "Axiom"} onSelect={() => selectService("Axiom")} />
            {snapshot.services.map((service) => <SelectableCard key={service.name}
              id={cardId("monitoring", service.name)} detailsId="service-detail-panel" name={service.name} status={service.status}
              tone={service.status} summary={service.detail || `Responded in ${service.latencyMs} ms`}
              selected={expandedService === service.name} onSelect={() => selectService(service.name)} />)}</div>
        </section>}
        </div>}
      </>
    </main></>;
}
