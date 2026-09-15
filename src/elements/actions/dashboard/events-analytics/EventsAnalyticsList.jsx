import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "@/util/navigation";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { selectUser } from "../../../../redux/user";
import { sessionClaims } from "../../../../util/functions/authorization";
import { ACCESS_2 } from "../../../../util/defines/common";
import { REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { Calendar, Skeleton } from "@/compat/primereact";
import Filter from "../Filter";
import EventAnalyticsAccordion from "./EventAnalyticsAccordion";
import { exportEventsCSV } from "./exportEvents";

const formatDateParam = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EventsAnalyticsList = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPresence: 0,
    totalTicketsSold: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const user = useSelector(selectUser);
  const { roles, region } = sessionClaims(user.session);
  const isAdmin = hasOverlap(roles, ACCESS_2);

  const [searchParams] = useSearchParams();
  const regionParam = REGIONS.includes(searchParams.get("region"))
    ? searchParams.get("region")
    : "";

  const { sendRequest } = useHttpClient();

  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;

  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (isAdmin && regionParam) params.set("region", regionParam);
        if (fromDate) params.set("from", formatDateParam(fromDate));
        if (toDate) params.set("to", formatDateParam(toDate));
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await requestRef.current(`dashboard/events-analytics${query}`, "GET", null, {}, true, false);
        if (active && response?.events) {
          setEvents(response.events);
          setSummary(response.summary);
        }
      } catch (error) {
        if (active) console.error("Error loading events analytics:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEvents();
    return () => { active = false; };
  }, [regionParam, fromDate, toDate, isAdmin]);

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
        <h1 className="center_text" style={{ margin: 0 }}>
          Event analytics
        </h1>
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
      <Filter showRegion={isAdmin} onClear={() => { setFromDate(null); setToDate(null); }}>
        <div className="event-analytics-date-filter__field">
          <label htmlFor="analytics-from-date">From</label>
          <Calendar
            inputId="analytics-from-date"
            value={fromDate}
            onChange={(event) => setFromDate(event.value)}
            className="dashboard-date-input"
            placeholder="Select start date"
            dateFormat="dd/mm/yy"
            maxDate={toDate ?? undefined}
          />
        </div>
        <div className="event-analytics-date-filter__field">
          <label htmlFor="analytics-to-date">To</label>
          <Calendar
            inputId="analytics-to-date"
            value={toDate}
            onChange={(event) => setToDate(event.value)}
            className="dashboard-date-input"
            placeholder="Select end date"
            dateFormat="dd/mm/yy"
            minDate={fromDate ?? undefined}
          />
        </div>
      </Filter>

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
        <div className="event-dashboard-content">
          {Object.entries(eventsByRegion).map(([regionKey, regionEvents]) => (
            <section className="region-section" key={regionKey}>
              <header className="region-section__header">
                <h2>{capitalizeFirstLetter(regionKey, true)}</h2>
                <span>{regionEvents.length}</span>
              </header>
              {regionEvents.length ? (
                <div className="events-analytics-list">
                  {regionEvents.map((event) => (
                    <EventAnalyticsAccordion key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="no-events-message">No current events for this region.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
};

export default EventsAnalyticsList;
