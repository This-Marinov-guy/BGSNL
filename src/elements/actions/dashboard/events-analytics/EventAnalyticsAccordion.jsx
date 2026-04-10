import React, { useState } from "react";
import moment from "moment";
import { MOMENT_DATE_TIME_YEAR } from "../../../../util/functions/date";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const EventAnalyticsAccordion = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="event-analytics-accordion">
      <div
        className="event-analytics-accordion__header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="event-analytics-accordion__poster">
          <img src={event.poster} alt={event.title} />
        </div>
        <div className="event-analytics-accordion__summary">
          <div className="event-analytics-accordion__name">{event.title}</div>
          <div className="event-analytics-accordion__meta">
            <span className="event-analytics-accordion__cost">
              {event.ticketCost}
            </span>
            <span className="event-analytics-accordion__date">
              {moment(event.date).format(MOMENT_DATE_TIME_YEAR)}
            </span>
            <span className="event-analytics-accordion__presence">
              {event.attended}/{event.totalTickets} ({event.presence}%)
            </span>
            <span className="event-analytics-accordion__revenue">
              €{event.revenue}
            </span>
          </div>
        </div>
        <div className="event-analytics-accordion__toggle">
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </div>
      </div>

      {expanded && (
        <div className="event-analytics-accordion__details">
          <div className="row mb--10">
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Tickets Sold</span>
                <span className="value">
                  {event.totalTickets} / {event.ticketLimit}
                </span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Attended</span>
                <span className="value">{event.attended}</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Presence Rate</span>
                <span className="value">{event.presence}%</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Revenue</span>
                <span className="value">€{event.revenue}</span>
              </div>
            </div>
          </div>

          {/* Guest list breakdown */}
          {event.guestList && event.guestList.length > 0 && (
            <div className="event-analytics-accordion__guests">
              <h5>Guest List ({event.guestList.length})</h5>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Purchased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.guestList.map((guest, i) => (
                      <tr
                        key={i}
                        style={
                          guest.refunded
                            ? { textDecoration: "line-through", opacity: 0.5 }
                            : {}
                        }
                      >
                        <td>{guest.name}</td>
                        <td>{guest.email}</td>
                        <td>{guest.type}</td>
                        <td>
                          <span
                            style={{
                              color:
                                guest.status === 1 ? "#28a745" : "#6c757d",
                            }}
                          >
                            {guest.status === 1 ? "Attended" : "No show"}
                          </span>
                        </td>
                        <td>
                          {guest.timestamp
                            ? moment(guest.timestamp).format("DD/MM/YYYY")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventAnalyticsAccordion;
