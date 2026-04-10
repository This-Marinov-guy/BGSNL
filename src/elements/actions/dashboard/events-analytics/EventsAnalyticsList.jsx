import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { selectUser } from "../../../../redux/user";
import { decodeJWT } from "../../../../util/functions/authorization";
import { ACCESS_2 } from "../../../../util/defines/common";
import { REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { Skeleton } from "primereact/skeleton";
import Filter from "../Filter";
import EventAnalyticsAccordion from "./EventAnalyticsAccordion";
import { exportEventsCSV } from "./exportEvents";

const EventsAnalyticsList = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPresence: 0,
    totalTicketsSold: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const user = useSelector(selectUser);
  const { roles, region } = decodeJWT(user.token);
  const isAdmin = hasOverlap(roles, ACCESS_2);

  const [searchParams] = useSearchParams();
  const regionParam = REGIONS.includes(searchParams.get("region"))
    ? searchParams.get("region")
    : "";

  const { sendRequest } = useHttpClient();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (isAdmin && regionParam) params.set("region", regionParam);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const query = params.toString() ? `?${params.toString()}` : "";

      const responseData = await sendRequest(
        `dashboard/events-analytics${query}`,
        "GET",
        null,
        {},
        true,
        false
      );

      if (responseData?.events) {
        setEvents(responseData.events);
        setSummary(responseData.summary);
      }
    } catch (err) {
      console.error("Error loading events analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [regionParam]);

  const handleFilter = () => {
    fetchEvents();
  };

  // Group events by region
  const eventsByRegion = {};
  const regionList = isAdmin
    ? regionParam
      ? REGIONS.filter((r) => r === regionParam)
      : REGIONS
    : REGIONS.filter((r) => r === region);

  for (const r of regionList) {
    eventsByRegion[r] = events.filter((e) => e.region === r);
  }

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb--30 flex-wrap"
        style={{ gap: "15px" }}
      >
        <h3 className="center_text" style={{ margin: 0 }}>
          Events Analytics
        </h3>
        <button
          className="rn-button-style--2 rn-btn-green"
          onClick={() => exportEventsCSV(events)}
          disabled={loading || events.length === 0}
        >
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Panels */}
      <div className="row mb--30">
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">Total Revenue</div>
            <div className="dashboard-stat-card__value">
              {loading ? (
                <Skeleton width="80px" />
              ) : (
                `€${summary.totalRevenue}`
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">Total Presence</div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalPresence}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">Tickets Sold</div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalTicketsSold}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__label">Total Events</div>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalEvents}
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="common-border-1 mb--20">
        <h4>Date Filter</h4>
        <div className="row align-items-end" style={{ gap: "10px 0" }}>
          <div className="col-lg-4 col-md-4 col-12">
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="dashboard-date-input"
            />
          </div>
          <div className="col-lg-4 col-md-4 col-12">
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="dashboard-date-input"
            />
          </div>
          <div className="col-lg-4 col-md-4 col-12">
            <button
              className="rn-button-style--2 rn-btn-green"
              onClick={handleFilter}
              disabled={loading}
              style={{ width: "100%" }}
            >
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {isAdmin && <Filter />}

      {loading ? (
        <div className="row mt--20">
          <div className="col-12 mb--20">
            <p>Loading events analytics, please be patient!</p>
            <Skeleton className="mb-2" />
            <Skeleton width="10rem" className="mb-2" />
            <Skeleton width="5rem" className="mb-2" />
          </div>
        </div>
      ) : (
        <div className="mt--20">
          {Object.entries(eventsByRegion).map(
            ([regionKey, regionEvents], index) => (
              <div className="region-section" key={regionKey}>
                <div className="row">
                  <div className="col-12">
                    <h4 className="archive region-title">
                      {capitalizeFirstLetter(regionKey, true)} ({regionEvents.length})
                    </h4>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    {regionEvents.length ? (
                      <div className="events-analytics-list">
                        {regionEvents.map((event) => (
                          <EventAnalyticsAccordion
                            key={event._id}
                            event={event}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="no-events-message">
                        No events for this region
                      </p>
                    )}
                  </div>
                </div>
                {index <
                  Object.keys(eventsByRegion).length - 1 && (
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

export default EventsAnalyticsList;
