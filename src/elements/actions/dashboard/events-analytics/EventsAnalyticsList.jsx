import { formatDisplayDate } from "@/util/functions/display-date.mjs";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Skeleton, SelectInput } from "@/compat/primereact";
import InfoHint from "@/elements/ui/icons/InfoHint";
import { useHttpClient } from "@/hooks/common/http-hook";
import { selectUser } from "@/redux/user";
import { sessionClaims } from "@/util/functions/authorization";
import { ALL_EVENT_REGIONS_ACCESS } from "@/util/defines/common";
import { REGIONS, STATISTICS_REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { dayKey, eventGuestCapacity, eventRevenueByEvent } from "@/util/analytics/statistics-period.mjs";
import { eventAverageComparison } from "@/util/analytics/event-average-comparison.mjs";
import Filter from "../Filter";
import { StatisticsDateField, useStatisticsPeriod } from "../StatisticsPeriod";
import { statisticsTooltipStyle } from "../statistics-tooltip.mjs";
import styles from "../statistics-page.module.scss";

const euro = new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" });
const number = new globalThis.Intl.NumberFormat("en-NL");
const percentage = new globalThis.Intl.NumberFormat("en-NL", { maximumFractionDigits: 1 });
const daysAndHours = (value) => {
  const hours = Math.max(0, Math.round(value));
  return `${number.format(Math.floor(hours / 24))}d ${number.format(hours % 24)}h`;
};
const axis = { fill: "#607168", fontSize: 12 };
const averageMetrics = [
  { key: "averageEventPresence", label: "Average time from creation to event", format: daysAndHours, detail: "Time from event creation to its scheduled date." },
  { key: "averageEventTicketCount", label: "Average tickets per event", format: value => number.format(value), detail: "Issued tickets per event, including refunded tickets." },
  { key: "averageEventTicketTypeRatio", label: "Average member share of tickets", format: value => `${percentage.format(value)}%`, detail: "Member, active member, and alumni tickets as a share of all issued tickets." },
  { key: "averageEventRevenue", label: "Average revenue per event", format: value => euro.format(value), detail: "Estimated net ticket and add-on revenue per event." },
  { key: "averageEventRefund", label: "Average refunds per event", format: value => euro.format(value), detail: "Recorded refund amounts per event." },
];

export default function EventsAnalyticsList() {
  const [events, setEvents] = useState([]);
  const [averages, setAverages] = useState({});
  const [nationalAverages, setNationalAverages] = useState({});
  const [eventOptionsByRegion, setEventOptionsByRegion] = useState({ region: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const user = useSelector(selectUser);
  const { roles, region: assignedRegion } = sessionClaims(user.session);
  const canChooseRegion = roles.some((role) => ALL_EVENT_REGIONS_ACCESS.includes(role));
  const missingRegion = !canChooseRegion && !REGIONS.includes(assignedRegion);
  const { searchParams, setSearchParams, from, to, setDate, invalid } = useStatisticsPeriod();
  const region = canChooseRegion && STATISTICS_REGIONS.includes(searchParams.get("region")) ? searchParams.get("region") : "";
  const eventOptions = eventOptionsByRegion.region === region ? eventOptionsByRegion.items : [];
  const eventId = searchParams.get("event") || "";
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
    requestRef.current(`dashboard/event-statistics?${params}`, "GET", null, {}, false, false, { signal: controller.signal })
      .then((response) => {
        if (!active) return;
        if (!Array.isArray(response?.events) || !Array.isArray(response?.eventOptions) || !response?.averages || !response?.nationalAverages) { setError(true); return; }
        setEvents(response.events);
        setAverages(response.averages);
        setNationalAverages(response.nationalAverages);
        setEventOptionsByRegion({ region, items: response.eventOptions });
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [from, to, region, invalid, missingRegion, retry]);

  const selectedEvent = eventId ? events.find((event) => event._id === eventId) : null;
  const selectedMissing = Boolean(eventId && !selectedEvent && !loading && !error);
  const visibleEvents = eventId ? selectedEvent ? [selectedEvent] : [] : events;
  const totalRevenue = visibleEvents.reduce((total, event) => total + (Number(event.revenue) || 0), 0);
  const totalRefunds = visibleEvents.reduce((total, event) => total + (Number(event.refunds) || 0), 0);
  const totalTickets = visibleEvents.reduce((total, event) => total + (Number(event.ticketCount) || 0), 0);
  const memberTickets = visibleEvents.reduce((total, event) => total + (Number(event.memberTickets) || 0), 0);
  const guestTickets = visibleEvents.reduce((total, event) => total + (Number(event.guestTickets) || 0), 0);
  const revenueByEvent = eventRevenueByEvent(visibleEvents, from, to);
  const guestCapacity = eventGuestCapacity(visibleEvents);
  const hasEvents = visibleEvents.length > 0;
  const isNational = canChooseRegion && !region;

  const changeEvent = (value) => setSearchParams((current) => {
    if (value) {
      current.set("event", value);
      const selectedDate = dayKey(eventOptions.find((event) => event._id === value)?.date);
      if (selectedDate && (selectedDate < from || selectedDate > to)) {
        current.set("from", selectedDate);
        current.set("to", selectedDate);
      }
    } else current.delete("event");
    return current;
  });

  return <section className={styles.page} aria-label="Event metrics">
    <Filter title="Filter event metrics" allLabel="National" regions={STATISTICS_REGIONS} showRegion={canChooseRegion} onRegionChange={(current) => current.delete("event")} onClear={(current) => {
      current.delete("from"); current.delete("to"); current.delete("event");
    }}>
      <label><span>Event</span><SelectInput value={eventId} disabled={missingRegion} onChange={(event) => changeEvent(event.target.value)}>
        <option value="">All events</option>
        {loading && eventOptions.length === 0 && <option value="" disabled>Loading events…</option>}
        {!loading && !error && eventOptions.length === 0 && <option value="" disabled>No events available</option>}
        {eventOptions.map((event) => <option key={event._id} value={event._id}>{event.title} · {formatDisplayDate(event.date)}</option>)}
      </SelectInput></label>
      <StatisticsDateField label="From" dateKey="from" value={from} onChange={setDate} />
      <StatisticsDateField label="To" dateKey="to" value={to} onChange={setDate} />
    </Filter>
    {missingRegion ? <p className={styles.empty}>Your account needs an assigned region before you can view event metrics. Ask an administrator to set your region.</p> :
      invalid ? <p className={styles.error} role="alert">The start date must be before the end date. Choose a valid date range or reset the filters.</p> :
      error ? <p className={styles.error} role="alert">Event metrics could not be loaded. <button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></p> :
      selectedMissing ? <p className={styles.error} role="alert">That event is outside the selected region or dates. <button type="button" onClick={() => changeEvent("")}>Show all events</button></p> : <>
        <div className={`${styles.metrics} ${styles.eventTotals}`} aria-busy={loading}>
          <article className={styles.metric}><span>Total tickets</span><strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : number.format(totalTickets)}</strong><div className={styles.ticketBreakdown}>{loading ? <Skeleton width="9rem" height="1rem" /> : <><small className={styles.ticketMembers}>Members {number.format(memberTickets)}</small><small className={styles.ticketGuests}>Guests {number.format(guestTickets)}</small></>}</div></article>
          <article className={`${styles.metric} ${styles.metricActive}`}><span>Total revenue</span><strong>{loading ? <Skeleton width="7rem" height="2.5rem" /> : euro.format(totalRevenue)}</strong></article>
          <article className={`${styles.metric} ${styles.metricInactive}`}><span>Total refunds</span><strong>{loading ? <Skeleton width="7rem" height="2.5rem" /> : euro.format(totalRefunds)}</strong></article>
          <article className={styles.metric}><span>Total events</span><strong>{loading ? <Skeleton width="5rem" height="2.5rem" /> : number.format(visibleEvents.length)}</strong></article>
        </div>

        <section className={`${styles.averageSection} ${styles.eventAverageSection}`} aria-labelledby="event-average-title" aria-busy={loading}>
          <h2 id="event-average-title">Event averages</h2>
          {averageMetrics.map(({ key, label, format, detail }) => {
            const value = averages[key];
            const nationalValue = nationalAverages[key];
            const display = value == null ? "—" : format(value);
            return <article className={styles.metric} key={key}>
              <span>{label}</span>
              <strong>{loading ? <Skeleton width="6rem" height="2.5rem" /> : display}</strong>
              {!isNational && (loading ? <Skeleton width="8rem" height="1rem" /> : <div className={styles.averageComparisonRow}>
                <small className={styles.averageComparison}>{eventAverageComparison(value, nationalValue, isNational)}</small>
                {nationalValue != null && <InfoHint icon="info" label={`National baseline for ${label.toLowerCase()}`} text={`${detail} National baseline: ${format(nationalValue)}.`} />}
              </div>)}
            </article>;
          })}
          {!loading && averages.eventCount === 0 && <p>No published events fall in this period yet.</p>}
        </section>

        {!loading && !hasEvents ? <p className={styles.empty}>No events match this region and date range. Choose another period or reset the filters.</p> : <div className={styles.timelineGrid} aria-busy={loading}>
          <section className={styles.chart} aria-labelledby="event-revenue-chart">
            <h2 id="event-revenue-chart">Revenue over event</h2>
            {loading ? <Skeleton height="19rem" /> : <div className={styles.chartScroll}>
              <div className={styles.chartCanvas} style={{ width: `${Math.max(440, revenueByEvent.length * 110)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEvent} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5cf" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} minTickGap={14} />
                  <YAxis tickLine={false} axisLine={false} tick={axis} tickFormatter={(value) => `€${value}`} width={54} />
                  <Tooltip {...statisticsTooltipStyle} formatter={(value) => euro.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload ? `${payload[0].payload.title} · ${formatDisplayDate(payload[0].payload.date)}` : ""} />
                  <Bar dataKey="revenue" name="Revenue" fill="var(--dashboard-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>}
          </section>
          <section className={styles.chart} aria-labelledby="event-guest-capacity">
            <h2 id="event-guest-capacity">Guests by event</h2>
            {loading ? <Skeleton height="19rem" /> : <div className={styles.chartScroll}>
              <div className={styles.chartCanvas} style={{ width: `${Math.max(440, guestCapacity.length * 110)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={guestCapacity} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5cf" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} minTickGap={14} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axis} width={32} />
                  <Tooltip {...statisticsTooltipStyle} labelFormatter={(_, payload) => payload?.[0]?.payload ? `${payload[0].payload.title} · ${formatDisplayDate(payload[0].payload.date)}` : ""} />
                  <Legend />
                  <Bar dataKey="guests" name="Guests" fill="var(--dashboard-accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="limit" name="Ticket limit" fill="#b7c9dc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>}
          </section>
        </div>}
        {!loading && hasEvents && <><table className={styles.srOnly}><caption>Revenue over event</caption><thead><tr><th scope="col">Event</th><th scope="col">Date</th><th scope="col">Revenue</th></tr></thead><tbody>{revenueByEvent.map((event) => <tr key={event.id}><th scope="row">{event.title}</th><td>{formatDisplayDate(event.date)}</td><td>{euro.format(event.revenue)}</td></tr>)}</tbody></table>
          <table className={styles.srOnly}><caption>Guests and ticket limit by event</caption><thead><tr><th scope="col">Event</th><th scope="col">Date</th><th scope="col">Guests</th><th scope="col">Ticket limit</th></tr></thead><tbody>{guestCapacity.map((event) => <tr key={event.id}><th scope="row">{event.title}</th><td>{formatDisplayDate(event.date)}</td><td>{event.guests}</td><td>{event.limit ?? "Not set"}</td></tr>)}</tbody></table></>}
      </>}
  </section>;
}
