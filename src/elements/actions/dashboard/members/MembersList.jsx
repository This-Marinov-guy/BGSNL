import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/compat/primereact";
import InfoHint from "@/elements/ui/icons/InfoHint";
import { useHttpClient } from "@/hooks/common/http-hook";
import { selectUser } from "@/redux/user";
import { sessionClaims } from "@/util/functions/authorization";
import { ALL_MEMBER_REGIONS_ACCESS } from "@/util/defines/common";
import { REGIONS, STATISTICS_REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { memberAverageComparison } from "@/util/analytics/member-average-comparison.mjs";
import { monthBuckets } from "@/util/analytics/statistics-period.mjs";
import Filter from "../Filter";
import { StatisticsDateField, useStatisticsPeriod } from "../StatisticsPeriod";
import { statisticsTooltipStyle } from "../statistics-tooltip.mjs";
import styles from "../statistics-page.module.scss";

const euro = new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" });
const number = new globalThis.Intl.NumberFormat("en-NL");
const wholeNumber = new globalThis.Intl.NumberFormat("en-NL", { maximumFractionDigits: 0 });
const axis = { fill: "#607168", fontSize: 12 };

function MonthlyAverageCard({ label, value, nationalValue, isNational, loading }) {
  const comparison = memberAverageComparison(value, nationalValue, isNational);
  const toneClass = comparison.tone === "up" ? styles.averageComparisonUp : comparison.tone === "down" ? styles.averageComparisonDown : "";
  const hasNationalBaseline = nationalValue != null && Number.isFinite(Number(nationalValue)) && Number(nationalValue) > 0;
  return <article className={styles.metric}>
    <span>{label}</span>
    <strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : value == null ? "—" : wholeNumber.format(value)}</strong>
    {!isNational && (loading ? <Skeleton width="9rem" height="1rem" /> : <div className={styles.averageComparisonRow}>
      <small className={`${styles.averageComparison} ${toneClass}`}>{comparison.label}</small>
      {hasNationalBaseline && value != null && <InfoHint icon="info" label={`National baseline for ${label.toLowerCase()}`} text={`National baseline: ${wholeNumber.format(nationalValue)} ${label.toLowerCase()}.`} />}
    </div>)}
  </article>;
}

MonthlyAverageCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  nationalValue: PropTypes.number,
  isNational: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default function MembersList({ tabs }) {
  const [statistics, setStatistics] = useState({ summary: { totalActive: 0, totalInactive: 0, mmr: 0 }, monthly: {}, activeMonthly: {}, averages: {}, nationalAverages: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const user = useSelector(selectUser);
  const { roles, region: assignedRegion } = sessionClaims(user.session);
  const canChooseRegion = roles.some((role) => ALL_MEMBER_REGIONS_ACCESS.includes(role));
  const missingRegion = !canChooseRegion && !REGIONS.includes(assignedRegion);
  const { searchParams, from, to, setDate, invalid } = useStatisticsPeriod();
  const region = canChooseRegion && STATISTICS_REGIONS.includes(searchParams.get("region")) ? searchParams.get("region") : "";
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;

  useEffect(() => {
    if (invalid || missingRegion) { setLoading(false); return undefined; }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ from, to });
    if (region) params.set("region", region);
    requestRef.current(`dashboard/member-statistics?${params}`, "GET", null, {}, false, false, { signal: controller.signal })
      .then((response) => {
        if (!active) return;
        if (!response?.summary || !response?.monthly || !response?.activeMonthly || !response?.averages || !response?.nationalAverages) { setError(true); return; }
        setStatistics(response);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [region, from, to, invalid, missingRegion, retry]);

  const { totalActive: active, totalInactive: inactive, mmr } = statistics.summary;
  const buckets = monthBuckets(from, to);
  const timeline = buckets.filter((bucket) => Object.hasOwn(statistics.activeMonthly, bucket.key))
    .map((bucket) => ({ ...bucket, members: statistics.activeMonthly[bucket.key] }));
  const newMembers = buckets.reduce((total, bucket) => total + (statistics.monthly[bucket.key] || 0), 0);
  const hasMembers = active + inactive > 0;
  const isNational = canChooseRegion && !region;

  return <section className={styles.page} aria-label="Member metrics">
    <header className={styles.heading}>
      <h1>Member metrics</h1>
      {tabs}
    </header>

    <Filter title="Filter member metrics" allLabel="National" regions={STATISTICS_REGIONS} showRegion={canChooseRegion} onClear={(current) => {
      current.delete("from"); current.delete("to"); current.delete("memberStatus");
    }}>
      <StatisticsDateField label="From" dateKey="from" value={from} onChange={setDate} />
      <StatisticsDateField label="To" dateKey="to" value={to} onChange={setDate} />
    </Filter>

    {missingRegion ? <p className={styles.empty}>Your account needs an assigned region before you can view member metrics. Ask an administrator to set your region.</p> :
      invalid ? <p className={styles.error} role="alert">The start date must be before the end date. Choose a valid date range or reset the filters.</p> :
      error ? <p className={styles.error} role="alert">Member metrics could not be loaded. <button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></p> : <>
        <div className={`${styles.metrics} ${styles.memberSummary}`} aria-busy={loading}>
          <article className={`${styles.metric} ${styles.metricActive}`}><span>Active members</span><strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : number.format(active)}</strong></article>
          <article className={styles.metric}><span>New members</span><strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : number.format(newMembers)}</strong></article>
          <article className={`${styles.metric} ${styles.metricInactive}`}><span>Inactive members</span><strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : number.format(inactive)}</strong></article>
          <article className={styles.metric}><span>Monthly recurring revenue (MMR)</span><strong>{loading ? <Skeleton width="7rem" height="2.5rem" /> : euro.format(mmr)}</strong></article>
        </div>

        <section className={styles.averageSection} aria-labelledby="member-average-title" aria-busy={loading}>
          <h2 id="member-average-title">Monthly averages</h2>
          <div className={styles.metrics} style={{ "--stat-columns": 2 }}>
            <MonthlyAverageCard label="Active members per month" value={statistics.averages.averageActiveMembersMonth} nationalValue={statistics.nationalAverages.averageActiveMembersMonth} isNational={isNational} loading={loading} />
            <MonthlyAverageCard label="New members per month" value={statistics.averages.averageNewMembersMonth} nationalValue={statistics.nationalAverages.averageNewMembersMonth} isNational={isNational} loading={loading} />
          </div>
        </section>

        {!loading && !hasMembers ? <p className={styles.empty}>No members found for this region selection.</p> : <section className={styles.chart} aria-labelledby="member-timeline-title" aria-busy={loading}>
          <h2 id="member-timeline-title">Active members over time</h2>
          {loading ? <Skeleton height="19rem" /> : !timeline.length ? <p>No dates in this period have occurred yet.</p> : <div className={styles.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5cf" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} minTickGap={14} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axis} width={32} />
                <Tooltip {...statisticsTooltipStyle} />
                <Line type="monotone" dataKey="members" name="Active members" stroke="var(--dashboard-accent)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>}
        </section>}
        {!loading && timeline.length > 0 && <table className={styles.srOnly}><caption>Active members by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Active members</th></tr></thead><tbody>{timeline.map((month) => <tr key={month.key}><th scope="row">{month.label}</th><td>{month.members}</td></tr>)}</tbody></table>}
      </>}
  </section>;
}

MembersList.propTypes = { tabs: PropTypes.node.isRequired };
