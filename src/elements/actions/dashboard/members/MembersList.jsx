import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { selectUser } from "../../../../redux/user";
import {
  sessionClaims,
} from "../../../../util/functions/authorization";
import { ALL_MEMBER_REGIONS_ACCESS } from "../../../../util/defines/common";
import { REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import {
  capitalizeFirstLetter,
} from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { SelectInput, Skeleton } from "@/compat/primereact";
import Filter from "../Filter";
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";
import MemberAccordion from "./MemberAccordion";
import { exportMemberDemographicsCSV, exportMembersCSV } from "./exportMembers";

const MEMBER_STATUS_FILTERS = new Set(["active", "expired"]);

const memberStatusCounts = (list) => list.reduce((counts, member) => {
  if (member.isPaid) counts.active += 1;
  else counts.expired += 1;
  return counts;
}, { active: 0, expired: 0 });

const chartNumber = (value) => Number.isFinite(value) ? value : 0;

const euro = new globalThis.Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const membershipTrend = (list) => {
  const months = Array.from({ length: 6 }, (_, index) => moment().startOf("month").subtract(5 - index, "months"));
  const buckets = new Map(months.map((month) => [month.format("YYYY-MM"), {
    key: month.format("YYYY-MM"),
    label: month.format("MMM"),
    starts: 0,
    newMrr: 0,
  }]));

  list.forEach((member) => {
    const started = moment(member.startDate);
    if (!started.isValid()) return;
    const bucket = buckets.get(started.format("YYYY-MM"));
    if (!bucket) return;
    bucket.starts += 1;
    bucket.newMrr += Number(member.monthlyRevenue) || 0;
  });

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    newMrr: Math.round(bucket.newMrr * 100) / 100,
  }));
};

const MembersStatsChart = ({ data, mode }) => {
  const hasData = data.some((entry) => chartNumber(entry.active) + chartNumber(entry.expired) > 0);

  return (
    <section className="members-statistics-chart" aria-labelledby="members-statistics-chart-title">
      <div className="members-statistics-chart__header">
        <div>
          <h4 id="members-statistics-chart-title">
            {mode === "regions" ? "Members by city" : "Visible members"}
          </h4>
          <p>
            {mode === "regions"
              ? "Active and expired members grouped by region."
              : "Active and expired split for the current access and filters."}
          </p>
        </div>
      </div>
      {hasData ? (
        <div className="members-statistics-chart__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5ece8" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fill: "#526158", fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(1, 115, 99, 0.06)" }} />
              <Legend />
              <Bar dataKey="active" name="Active" stackId="members" fill="#017363" radius={[5, 5, 0, 0]} />
              <Bar dataKey="expired" name="Expired" stackId="members" fill="#dc3545" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="members-statistics-chart__empty">No member statistics for the current filters.</p>
      )}
    </section>
  );
};

MembersStatsChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    active: PropTypes.number.isRequired,
    expired: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  mode: PropTypes.oneOf(["regions", "overall"]).isRequired,
};

const MemberRevenueTrend = ({ data }) => {
  const hasData = data.some((entry) => entry.starts > 0 || entry.newMrr > 0);

  return (
    <section className="analytics-trend-card" aria-labelledby="member-revenue-trend-title">
      <header className="analytics-trend-card__header">
        <div>
          <h4 id="member-revenue-trend-title">Membership growth and recurring value</h4>
          <p>New membership periods and their monthly recurring value for the last six months.</p>
        </div>
      </header>
      {hasData ? (
        <div className="analytics-trend-card__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5ece8" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} />
              <YAxis yAxisId="count" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} />
              <YAxis yAxisId="revenue" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
              <Tooltip formatter={(value, name) => [name === "New monthly value" ? euro.format(value) : value, name]} />
              <Legend />
              <Bar yAxisId="count" dataKey="starts" name="Membership starts" fill="#017363" radius={[5, 5, 0, 0]} />
              <Line yAxisId="revenue" type="monotone" dataKey="newMrr" name="New monthly value" stroke="#bd8a21" strokeWidth={3} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="analytics-trend-card__empty">No membership starts are available for the last six months.</p>}
    </section>
  );
};

MemberRevenueTrend.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    starts: PropTypes.number.isRequired,
    newMrr: PropTypes.number.isRequired,
  })).isRequired,
};


const MemberListSkeleton = () => (
  <div className="dashboard-list-skeleton mt--20" aria-hidden="true">
    {[0, 1].map((section) => (
      <section className="region-section" key={section}>
        <div className="row">
          <div className="col-12">
            <Skeleton width="11rem" height="1.75rem" className="mb-3" />
          </div>
        </div>
        <div className="members-accordion-list">
          {[0, 1, 2].map((row) => (
            <div className="dashboard-list-skeleton__row member-accordion" key={row}>
              <div className="dashboard-list-skeleton__main">
                <Skeleton width="min(16rem, 70%)" height="1.2rem" />
                <div className="dashboard-list-skeleton__meta">
                  <Skeleton width="5.5rem" height="1rem" />
                  <Skeleton width="4.5rem" height="1rem" />
                  <Skeleton width="4rem" height="1rem" />
                  <Skeleton width="6rem" height="1rem" />
                </div>
              </div>
              <Skeleton shape="circle" size="2rem" />
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalUnpaid: 0,
    mmr: 0,
  });
  const [loading, setLoading] = useState(true);

  const user = useSelector(selectUser);
  const { roles, region } = sessionClaims(user.session);
  const isAdmin = hasOverlap(roles, ALL_MEMBER_REGIONS_ACCESS);

  const [searchParams, setSearchParams] = useFilterSearchParams();
  const regionParam = REGIONS.includes(searchParams.get("region"))
    ? searchParams.get("region")
    : "";
  const statusParam = MEMBER_STATUS_FILTERS.has(searchParams.get("memberStatus"))
    ? searchParams.get("memberStatus")
    : "";

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value;
    setSearchParams((current) => {
      if (MEMBER_STATUS_FILTERS.has(nextStatus)) current.set("memberStatus", nextStatus);
      else current.delete("memberStatus");
      return current;
    });
  };

  const { sendRequest } = useHttpClient();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const queryRegion = isAdmin && regionParam ? `?region=${regionParam}` : "";
        const responseData = await sendRequest(
          `dashboard/members${queryRegion}`,
          "GET",
          null,
          {},
          true,
          false,
          { signal: controller.signal }
        );

        if (active && responseData?.members) {
          setMembers(responseData.members);
          setSummary(responseData.summary);
        }
      } catch (err) {
        if (active) console.error("Error loading members:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMembers();
    return () => { active = false; controller.abort(); };
  }, [regionParam, isAdmin]);

  const filteredMembers = members.filter((member) => {
    if (statusParam === "active") return Boolean(member.isPaid);
    if (statusParam === "expired") return !member.isPaid;
    return true;
  });
  const statusLabel = statusParam ? `${statusParam} ` : "";

  // Group members by region
  const membersByRegion = {};
  const regionList = isAdmin
    ? regionParam
      ? REGIONS.filter((r) => r === regionParam)
      : REGIONS
    : REGIONS.filter((r) => r === region);

  for (const r of regionList) {
    membersByRegion[r] = filteredMembers.filter((m) => m.region === r);
  }

  // Members without a known region
  const unknownRegion = filteredMembers.filter(
    (m) => !m.region || !REGIONS.includes(m.region)
  );
  if (unknownRegion.length > 0) {
    membersByRegion["other"] = unknownRegion;
  }

  const chartMode = isAdmin && !regionParam ? "regions" : "overall";
  const chartData = chartMode === "regions"
    ? Object.entries(membersByRegion).map(([key, regionMembers]) => {
      const counts = memberStatusCounts(regionMembers);
      return {
        label: capitalizeFirstLetter(key, true),
        active: counts.active,
        expired: counts.expired,
      };
    })
    : (() => {
      const counts = memberStatusCounts(filteredMembers);
      return [
        { label: "Active", active: counts.active, expired: 0 },
        { label: "Expired", active: 0, expired: counts.expired },
      ];
    })();
  const activeCount = members.filter((member) => member.isPaid).length;
  const inactiveCount = members.length - activeCount;
  const expiringSoon = members.filter((member) => {
    if (!member.isPaid || !member.expireDate) return false;
    const expiry = moment(member.expireDate);
    return expiry.isSameOrAfter(moment(), "day") && expiry.isSameOrBefore(moment().add(30, "days"), "day");
  }).length;
  const trendData = membershipTrend(filteredMembers);

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb--30 flex-wrap"
        style={{ gap: "15px" }}
      >
        <h3 className="center_text" style={{ margin: 0 }}>
          Member statistics
        </h3>
        <div className="analytics-export-actions">
          <button className="rn-button-style--2 rn-btn-green" onClick={() => exportMembersCSV(filteredMembers)} disabled={loading || filteredMembers.length === 0}><span>Export members</span></button>
          <button className="analytics-export-actions__secondary" onClick={() => exportMemberDemographicsCSV(filteredMembers)} disabled={loading || filteredMembers.length === 0}><span>Export demographics</span></button>
        </div>
      </div>

      {isAdmin && <Filter title="Member filters" onClear={() => {
        setSearchParams((current) => {
          current.delete("memberStatus");
          return current;
        });
      }}>
        <label>
          <span>Status</span>
          <SelectInput value={statusParam} onChange={handleStatusChange}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </SelectInput>
        </label>
      </Filter>}

      {/* Summary Panels */}
      <div className="row mb--30">
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">
              Monthly Recurring Revenue
            </p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="80px" /> : `€${summary.mmr}`}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">Active members</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : activeCount}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card dashboard-stat-card--warning">
            <p className="dashboard-stat-card__label">Inactive members</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : inactiveCount}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card dashboard-stat-card--attention">
            <p className="dashboard-stat-card__label">Renewals in 30 days</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : expiringSoon}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="members-statistics-chart members-statistics-chart--loading">
          <Skeleton width="12rem" className="mb-2" />
          <Skeleton height="14rem" />
        </div>
      ) : (
        <MembersStatsChart data={chartData} mode={chartMode} />
      )}

      {loading ? (
        <div className="analytics-trend-card analytics-trend-card--loading">
          <Skeleton width="16rem" className="mb-2" />
          <Skeleton height="15rem" />
        </div>
      ) : <MemberRevenueTrend data={trendData} />}

      <p className="analytics-data-note">Demographic exports contain regional and study data only; direct identifiers are excluded.</p>

      {loading ? (
        <MemberListSkeleton />
      ) : (
        <div className="mt--20">
          {Object.entries(membersByRegion).map(
            ([regionKey, regionMembers], index) => (
              <div className="region-section" key={regionKey}>
                <div className="row">
                  <div className="col-12">
                    <h4 className="archive region-title">
                      {capitalizeFirstLetter(regionKey, true)} ({regionMembers.length})
                    </h4>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    {regionMembers.length ? (
                      <div className="members-accordion-list">
                        {regionMembers.map((member) => (
                          <MemberAccordion key={member._id} member={member} />
                        ))}
                      </div>
                    ) : (
                      <p className="no-events-message">
                        No {statusLabel}members in this region
                      </p>
                    )}
                  </div>
                </div>
                {index <
                  Object.keys(membersByRegion).length - 1 && (
                  <hr className="region-divider" />
                )}
              </div>
            )
          )}
        </div>
      )}
    </>
  );
};

export default MembersList;
