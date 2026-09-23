import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { useSelector } from "react-redux";
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { selectUser } from "../../../../redux/user";
import { sessionClaims } from "../../../../util/functions/authorization";
import { ALL_EVENT_REGIONS_ACCESS } from "../../../../util/defines/common";
import { REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { Calendar, Skeleton } from "@/compat/primereact";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Filter from "../Filter";
import EventAnalyticsAccordion from "./EventAnalyticsAccordion";
import { exportEventsCSV } from "./exportEvents";

const formatDateParam = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateParam = (value) => {
  const parsed = moment(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.toDate() : null;
};

const euro = new globalThis.Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const completedEvents = (events) => events
  .filter((event) => new Date(event.date).getTime() <= Date.now())
  .sort((first, second) => new Date(first.date) - new Date(second.date));

const percentageChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
};

const EventPerformance = ({ events }) => {
  const completed = completedEvents(events);
  const latest = completed.at(-1);
  const previous = completed.at(-2);
  const chartData = completed.slice(-8).map((event) => ({
    label: moment(event.date).format("D MMM"),
    title: event.title,
    revenue: Number(event.revenue) || 0,
    tickets: Number(event.totalTickets) || 0,
  }));
  const averageRevenue = completed.length
    ? completed.reduce((total, event) => total + (Number(event.revenue) || 0), 0) / completed.length
    : 0;
  const averageTickets = completed.length
    ? completed.reduce((total, event) => total + (Number(event.totalTickets) || 0), 0) / completed.length
    : 0;
  const attendanceRate = completed.reduce((total, event) => total + (Number(event.attended) || 0), 0) /
    completed.reduce((total, event) => total + (Number(event.totalTickets) || 0), 0);
  const revenueChange = latest && previous ? percentageChange(Number(latest.revenue) || 0, Number(previous.revenue) || 0) : null;
  const ticketChange = latest && previous ? percentageChange(Number(latest.totalTickets) || 0, Number(previous.totalTickets) || 0) : null;

  if (!completed.length) {
    return <section className="analytics-trend-card analytics-trend-card--empty"><h4>Event performance</h4><p>Performance comparisons appear after the first event in the selected period has finished.</p></section>;
  }

  return (
    <section className="event-performance" aria-labelledby="event-performance-title">
      <header className="event-performance__header">
        <div>
          <h2 id="event-performance-title">Event performance</h2>
          <p>Revenue and ticket sales for completed events in the selected period.</p>
        </div>
        {latest && <span className="event-performance__latest">Latest: {latest.title}</span>}
      </header>
      <div className="event-performance__metrics">
        <article><span>Average revenue</span><strong>{euro.format(averageRevenue)}</strong></article>
        <article><span>Average tickets</span><strong>{averageTickets.toFixed(1)}</strong></article>
        <article><span>Attendance rate</span><strong>{Number.isFinite(attendanceRate) ? `${Math.round(attendanceRate * 100)}%` : "—"}</strong></article>
        <article><span>Latest vs previous</span><strong>{previous && revenueChange !== null ? `${revenueChange > 0 ? "+" : ""}${revenueChange}% revenue` : previous ? "No revenue baseline" : "Need one more event"}</strong><small>{previous && ticketChange !== null ? `${ticketChange > 0 ? "+" : ""}${ticketChange}% tickets` : ""}</small></article>
      </div>
      <div className="analytics-trend-card__canvas">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5ece8" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} />
            <YAxis yAxisId="tickets" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} />
            <YAxis yAxisId="revenue" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#526158", fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
            <Tooltip labelFormatter={(_, entries) => entries?.[0]?.payload?.title || ""} formatter={(value, name) => [name === "Revenue" ? euro.format(value) : value, name]} />
            <Legend />
            <Bar yAxisId="tickets" dataKey="tickets" name="Tickets sold" fill="#017363" radius={[5, 5, 0, 0]} />
            <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke="#bd8a21" strokeWidth={3} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

EventPerformance.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    attended: PropTypes.number,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    revenue: PropTypes.number,
    title: PropTypes.string.isRequired,
    totalTickets: PropTypes.number,
  })).isRequired,
};


const EventAnalyticsListSkeleton = () => (
  <div className="event-dashboard-content dashboard-list-skeleton" aria-hidden="true">
    {[0, 1].map((section) => (
      <section className="region-section" key={section}>
        <header className="region-section__header">
          <Skeleton width="10rem" height="1.75rem" />
          <Skeleton width="2.5rem" height="1.75rem" />
        </header>
        <div className="events-analytics-list">
          {[0, 1, 2].map((row) => (
            <div className="dashboard-list-skeleton__row event-analytics-accordion" key={row}>
              <Skeleton width="4rem" height="4rem" className="dashboard-list-skeleton__thumb" />
              <div className="dashboard-list-skeleton__main">
                <Skeleton width="min(18rem, 75%)" height="1.2rem" />
                <div className="dashboard-list-skeleton__meta">
                  <Skeleton width="5rem" height="1rem" />
                  <Skeleton width="8rem" height="1rem" />
                  <Skeleton width="5.5rem" height="1rem" />
                  <Skeleton width="4rem" height="1rem" />
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

const EventsAnalyticsList = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPresence: 0,
    totalTicketsSold: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const { roles, region } = sessionClaims(user.session);
  const isAdmin = hasOverlap(roles, ALL_EVENT_REGIONS_ACCESS);

  const [searchParams, setSearchParams] = useFilterSearchParams();
  const regionParam = REGIONS.includes(searchParams.get("region"))
    ? searchParams.get("region")
    : "";
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const fromDate = useMemo(() => parseDateParam(fromParam), [fromParam]);
  const toDate = useMemo(() => parseDateParam(toParam), [toParam]);

  const setDateFilter = (key, value) => {
    setSearchParams((current) => {
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        current.set(key, formatDateParam(value));
      } else {
        current.delete(key);
      }
      current.delete("page");
      return current;
    });
  };

  const { sendRequest } = useHttpClient();

  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (isAdmin && regionParam) params.set("region", regionParam);
        if (fromDate) params.set("from", formatDateParam(fromDate));
        if (toDate) params.set("to", formatDateParam(toDate));
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await requestRef.current(`dashboard/events-analytics${query}`, "GET", null, {}, true, false, { signal: controller.signal });
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
    return () => { active = false; controller.abort(); };
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

      <Filter showRegion={isAdmin} onClear={(current) => {
        current.delete("from");
        current.delete("to");
      }}>
        <div className="event-analytics-date-filter__field">
          <label htmlFor="analytics-from-date">From</label>
          <Calendar
            inputId="analytics-from-date"
            value={fromDate}
            onChange={(event) => setDateFilter("from", event.value)}
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
            onChange={(event) => setDateFilter("to", event.value)}
            className="dashboard-date-input"
            placeholder="Select end date"
            dateFormat="dd/mm/yy"
            minDate={fromDate ?? undefined}
          />
        </div>
      </Filter>

      {/* Summary Panels */}
      <div className="row mb--30">
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">Total Revenue</p>
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
            <p className="dashboard-stat-card__label">Total Presence</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalPresence}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">Tickets Sold</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalTicketsSold}
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb--15">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">Total Events</p>
            <div className="dashboard-stat-card__value">
              {loading ? <Skeleton width="60px" /> : summary.totalEvents}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="analytics-trend-card analytics-trend-card--loading">
          <Skeleton width="14rem" className="mb-2" />
          <Skeleton height="15rem" />
        </div>
      ) : <EventPerformance events={events} />}

      {loading ? (
        <EventAnalyticsListSkeleton />
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
