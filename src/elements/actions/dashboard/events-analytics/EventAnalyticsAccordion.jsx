import { useState } from "react";
import PropTypes from "prop-types";
import AnimatedDisclosure from "../../../ui/functional/AnimatedDisclosure";
import moment from "moment";
import {
  FiChevronDown,
  IconlyDocument,
} from "@/elements/ui/icons/IconlyIcons";
import { MOMENT_DATE_TIME_YEAR } from "../../../../util/functions/date";
import GuestListTable from "../GuestListTable";
import GuestListSearch from "../GuestListSearch";
import { useLiveGuestList } from "@/hooks/common/use-live-guest-list";
import { selectUser } from "@/redux/user";
import { useSelector } from "react-redux";
import { EVENT_MANAGEMENT_ACCESS } from "@/util/defines/common";
import { checkAuthorization } from "@/util/functions/authorization";

const EventAnalyticsAccordion = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const [extended, setExtended] = useState(false);
  const [search, setSearch] = useState("");
  const user = useSelector(selectUser);
  const canUpdatePresence = checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS);
  const { guests, columns, syncError, live, pendingGuestIds, updatePresence } = useLiveGuestList(event._id || event.id, expanded, event.guestList || [], event.columns || {});
  const attended = guests.filter((guest) => Number(guest.status) === 1).length;
  const totalTickets = guests.length;
  const presence = totalTickets ? Math.round((attended / totalTickets) * 100) : 0;

  return (
    <AnimatedDisclosure className="event-analytics-accordion" onExpandedChange={setExpanded} summary={<>
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
              <div className="event-details-modal__actions guest-list__actions" role="group" aria-label="Guest list actions">
                <button className="event-details-modal__action" type="button" aria-pressed={extended} onClick={() => setExtended(value => !value)}>
                  <IconlyDocument aria-hidden="true" /><span className="guest-list__toggle-label" key={String(extended)}>{extended ? "Compact" : "Extend"}</span>
                </button>
                <GuestListSearch value={search} onChange={setSearch} />
              </div>
              <GuestListTable columns={columns} search={search} extended={extended} editable={canUpdatePresence} guests={guests} onPresenceChange={updatePresence} pendingGuestIds={pendingGuestIds} />
            </div>
          )}
          <p role="status">{syncError ? "Connection interrupted. Attendance may be out of date; reconnecting." : live ? "Live attendance updates. Changes sync quietly in the background." : "Syncing in the background. Reconnecting to live updates."}</p>
        </div>
    </AnimatedDisclosure>
  );
};

EventAnalyticsAccordion.propTypes = { event: PropTypes.object.isRequired };

export default EventAnalyticsAccordion;
