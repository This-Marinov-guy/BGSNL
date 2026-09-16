import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { exportMembersCSV } from "./exportMembers";

const MEMBER_STATUS_FILTERS = new Set(["active", "expired"]);

const memberStatusCounts = (list) => list.reduce((counts, member) => {
  if (member.isPaid) counts.active += 1;
  else counts.expired += 1;
  return counts;
}, { active: 0, expired: 0 });

const chartNumber = (value) => Number.isFinite(value) ? value : 0;

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
          false
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
    return () => { active = false; };
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

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb--30 flex-wrap"
        style={{ gap: "15px" }}
      >
        <h3 className="center_text" style={{ margin: 0 }}>
          Member statistics
        </h3>
        <button
          className="rn-button-style--2 rn-btn-green"
          onClick={() => exportMembersCSV(filteredMembers)}
          disabled={loading || filteredMembers.length === 0}
        >
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Panels */}
      <div className="row mb--30">
        <div className="col-lg-4 col-md-4 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">
              Monthly Recurring Revenue
            </div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="80px" /> : `€${summary.mmr}`}
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-4 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">Total Members</div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalCount}
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-4 col-12 mb--15">
          <div className="dashboard-stat-card dashboard-stat-card--warning">
            <div className="dashboard-stat-card__label">Total Unpaid</div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalUnpaid}
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
