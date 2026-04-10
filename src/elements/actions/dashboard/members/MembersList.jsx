import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { selectUser } from "../../../../redux/user";
import {
  checkAuthorization,
  decodeJWT,
} from "../../../../util/functions/authorization";
import { ACCESS_2 } from "../../../../util/defines/common";
import { REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import {
  capitalizeFirstLetter,
  capitalizeAfterSpace,
} from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { Skeleton } from "primereact/skeleton";
import Filter from "../Filter";
import MemberAccordion from "./MemberAccordion";
import { exportMembersCSV } from "./exportMembers";
import moment from "moment";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalUnpaid: 0,
    mmr: 0,
  });
  const [loading, setLoading] = useState(true);

  const user = useSelector(selectUser);
  const { roles, region } = decodeJWT(user.token);
  const isAdmin = hasOverlap(roles, ACCESS_2);

  const [searchParams] = useSearchParams();
  const regionParam = REGIONS.includes(searchParams.get("region"))
    ? searchParams.get("region")
    : "";

  const { sendRequest } = useHttpClient();

  useEffect(() => {
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

        if (responseData?.members) {
          setMembers(responseData.members);
          setSummary(responseData.summary);
        }
      } catch (err) {
        console.error("Error loading members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [regionParam]);

  // Group members by region
  const membersByRegion = {};
  const regionList = isAdmin
    ? regionParam
      ? REGIONS.filter((r) => r === regionParam)
      : REGIONS
    : REGIONS.filter((r) => r === region);

  for (const r of regionList) {
    membersByRegion[r] = members.filter((m) => m.region === r);
  }

  // Members without a known region
  const unknownRegion = members.filter(
    (m) => !m.region || !REGIONS.includes(m.region)
  );
  if (unknownRegion.length > 0) {
    membersByRegion["other"] = unknownRegion;
  }

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb--30 flex-wrap"
        style={{ gap: "15px" }}
      >
        <h3 className="center_text" style={{ margin: 0 }}>
          Members
        </h3>
        <button
          className="rn-button-style--2 rn-btn-green"
          onClick={() => exportMembersCSV(members)}
          disabled={loading || members.length === 0}
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

      {isAdmin && <Filter />}

      {loading ? (
        <div className="row mt--20">
          <div className="col-12 mb--20">
            <p>Loading members, please be patient!</p>
            <Skeleton className="mb-2" />
            <Skeleton width="10rem" className="mb-2" />
            <Skeleton width="5rem" className="mb-2" />
          </div>
        </div>
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
                        No members in this region
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
