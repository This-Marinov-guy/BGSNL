import { Dialog, Skeleton } from "@/compat/primereact";
import GuestListTable from "../GuestListTable";
import GuestListSearch from "../GuestListSearch";
import { useLiveGuestList } from "@/hooks/common/use-live-guest-list";
import PropTypes from "prop-types";
import { IconlyQrCode, IconlyDocument } from "@/elements/ui/icons/IconlyIcons";

const GuestListModal = ({
  event,
  extended,
  maximized,
  onExtendedChange,
  onHide,
  onMaximizeChange,
  onSearchChange,
  search,
  visible,
}) => {
  const eventId = event.id || event._id;
  const { guests, columns, loading, syncError, live, pendingGuestIds, updatePresence } = useLiveGuestList(eventId, visible);
  const openScanner = () => {
    const url = new URL("/user/dashboard/ticket-scanner", window.location.origin);
    url.searchParams.set("forEvent", eventId);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const closeGuestList = () => {
    onHide();
  };

  return (
    <>
      <Dialog
        aria-label={`Guest list for ${event.title || "event"}`}
        className={`guest-list-modal${extended ? " guest-list-modal--extended" : ""}`}
        contentClassName="guest-list-modal__body"
        dismissableMask
        header={<div><h2>Guest list</h2><p>{event.title || "Event"}</p></div>}
        maximized={maximized}
        onMaximize={({ maximized: nextMaximized }) => onMaximizeChange(nextMaximized)}
        onHide={closeGuestList}
        visible={visible}
      >
        <div className="event-details-modal__actions guest-list__actions" role="group" aria-label="Guest list actions">
          <button className="event-details-modal__action" type="button" onClick={openScanner}><IconlyQrCode aria-hidden="true" /><span>Scan tickets</span></button>
          <button className="event-details-modal__action" type="button" aria-pressed={extended} onClick={() => onExtendedChange(!extended)}>
            <IconlyDocument aria-hidden="true" /><span className="guest-list__toggle-label" key={String(extended)}>{extended ? "Compact" : "Extend"}</span>
          </button>
          <GuestListSearch value={search} onChange={onSearchChange} />
        </div>
        {loading ? <div className="guest-list__skeleton" aria-hidden="true"><Skeleton height="2.5rem" /><Skeleton height="2.5rem" /><Skeleton height="2.5rem" /></div> : (
          <GuestListTable columns={columns} search={search} extended={extended} editable guests={guests} onPresenceChange={updatePresence} pendingGuestIds={pendingGuestIds} />
        )}
        <p className="guest-list__sync-note" role="status">{syncError ? "Connection interrupted. The list may be out of date; reconnecting automatically." : live ? "Live attendance updates. Changes sync quietly in the background." : "Syncing in the background. Reconnecting to live updates."}</p>
      </Dialog>

    </>
  );
};

GuestListModal.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  extended: PropTypes.bool.isRequired,
  maximized: PropTypes.bool.isRequired,
  onExtendedChange: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onMaximizeChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default GuestListModal;
