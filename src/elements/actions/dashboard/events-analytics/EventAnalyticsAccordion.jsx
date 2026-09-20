import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AnimatedDisclosure from "../../../ui/functional/AnimatedDisclosure";
import moment from "moment";
import {
  FiChevronDown,
} from "@/elements/ui/icons/IconlyIcons";
import { MOMENT_DATE_TIME_YEAR } from "../../../../util/functions/date";
import GuestListTable from "../GuestListTable";
import { useHttpClient } from "@/hooks/common/http-hook";
import { selectUser } from "@/redux/user";
import { useSelector } from "react-redux";
import { EVENT_MANAGEMENT_ACCESS } from "@/util/defines/common";
import { checkAuthorization } from "@/util/functions/authorization";

const EventAnalyticsAccordion = ({ event }) => {
  const [guests, setGuests] = useState(event.guestList || []);
  const [pendingGuestIds, setPendingGuestIds] = useState([]);
  const user = useSelector(selectUser);
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;
  const canUpdatePresence = checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS);
  const attended = guests.filter((guest) => Number(guest.status) === 1).length;
  const totalTickets = guests.length;
  const presence = totalTickets ? Math.round((attended / totalTickets) * 100) : 0;

  useEffect(() => {
    setGuests(event.guestList || []);
  }, [event.guestList]);

  const updatePresence = async (guest) => {
    const guestId = String(guest.id || guest._id || "");
    if (!guestId || pendingGuestIds.includes(guestId)) return;
    const present = Number(guest.status) !== 1;
    const before = guests;
    setGuests((current) => current.map((item) => String(item.id || item._id || "") === guestId ? { ...item, status: present ? 1 : 0 } : item));
    setPendingGuestIds((current) => [...current, guestId]);
    try {
      const response = await requestRef.current("event/guest-presence", "PATCH", { eventId: event._id, guestId, present }, {}, true, false);
      if (!response?.status) setGuests(before);
    } finally {
      setPendingGuestIds((current) => current.filter((id) => id !== guestId));
    }
  };

  return (
    <AnimatedDisclosure className="event-analytics-accordion" summary={<>
      <div
        className="event-analytics-accordion__header"
      >
        <div className="event-analytics-accordion__poster">
          <img
            src={event.poster}
            alt={`${event.title} poster`}
            loading="eager"
            decoding="async"
          />
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
              {attended}/{totalTickets} ({presence}%)
            </span>
            <span className="event-analytics-accordion__revenue">
              €{event.revenue}
            </span>
          </div>
        </div>
        <div className="event-analytics-accordion__toggle">
          <FiChevronDown className="animated-disclosure__chevron" size={20} aria-hidden="true" />
        </div>
      </div>
      </>}>
        <div className="event-analytics-accordion__details">
          <div className="row mb--10">
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Tickets Sold</span>
                <span className="value">
                  {totalTickets} / {event.ticketLimit}
                </span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Attended</span>
                <span className="value">{attended}</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Presence Rate</span>
                <span className="value">{presence}%</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="event-analytics-accordion__stat">
                <span className="label">Revenue</span>
                <span className="value">€{event.revenue}</span>
              </div>
            </div>
          </div>

          {guests.length > 0 && (
            <div className="event-analytics-accordion__guests">
              <h5>Guest list ({guests.length})</h5>
              <GuestListTable columns={event.columns} editable={canUpdatePresence} guests={guests} onPresenceChange={updatePresence} pendingGuestIds={pendingGuestIds} />
            </div>
          )}
        </div>
    </AnimatedDisclosure>
  );
};

EventAnalyticsAccordion.propTypes = { event: PropTypes.object.isRequired };

export default EventAnalyticsAccordion;
