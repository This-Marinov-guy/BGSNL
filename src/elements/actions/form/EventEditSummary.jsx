"use client";

import PropTypes from "prop-types";
import { FiChevronDown, FiImage } from "../../ui/icons/IconlyIcons";

const dateFormat = new globalThis.Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam",
});
const timeFormat = new globalThis.Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam",
});

export default function EventEditSummary({ event }) {
  const draft = event.status === "draft" ? event.draftData : null;
  const title = event.title?.trim() || draft?.title?.trim() || "Untitled event";
  const poster = event.poster || draft?.poster;
  const rawDate = event.date || draft?.date;
  const date = rawDate ? new Date(rawDate) : null;
  const hasDate = date && Number.isFinite(date.valueOf());
  const content = <div className="event-edit-summary__content">
    {typeof poster === "string" && poster ? <img className="event-edit-summary__poster" src={poster} alt={`${title} poster`} /> : <span className="event-edit-summary__poster event-edit-summary__placeholder" role="img" aria-label="No poster"><FiImage size={28} aria-hidden="true" /></span>}
    <span className="event-edit-summary__dot" aria-hidden="true">·</span>
    <dl className="event-edit-summary__facts">
      <div><dt>Event name</dt><dd>{title}</dd></div>
      <div><dt>Date and time</dt><dd>{hasDate ? <time dateTime={date.toISOString()}>{dateFormat.format(date)} <span className="event-edit-summary__time-dot" aria-hidden="true">·</span> {timeFormat.format(date)}</time> : "Date and time not set"}</dd></div>
    </dl>
  </div>;

  return <div className="event-edit-summary">
    <div className="event-edit-summary__desktop" aria-label="Event details">{content}</div>
    <details className="event-edit-summary__mobile">
      <summary>Event details <FiChevronDown aria-hidden="true" /></summary>
      {content}
    </details>
  </div>;
}

EventEditSummary.propTypes = { event: PropTypes.object.isRequired };
