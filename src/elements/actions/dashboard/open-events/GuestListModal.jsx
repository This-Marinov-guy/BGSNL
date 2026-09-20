import { Dialog, Skeleton } from "@/compat/primereact";
import GuestListTable from "../GuestListTable";
import { useHttpClient } from "@/hooks/common/http-hook";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

const GuestListModal = ({ event, onHide, visible }) => {
  const [guests, setGuests] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingGuestIds, setPendingGuestIds] = useState([]);
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;
  const eventId = event.id || event._id;

  useEffect(() => {
    if (!visible || !eventId) return undefined;
    let active = true;
    setLoading(true);
    requestRef.current(`event/guest-list/${eventId}`, "GET", null, {}, true, false)
      .then((response) => {
        if (active) {
          setGuests(response?.guestList || []);
          setColumns(response?.columns || {});
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [eventId, visible]);

  const updatePresence = async (guest) => {
    const guestId = String(guest.id || guest._id || "");
    if (!guestId || pendingGuestIds.includes(guestId)) return;
    const present = Number(guest.status) !== 1;
    const before = guests;
    setGuests((current) => current.map((item) => String(item.id || item._id || "") === guestId ? { ...item, status: present ? 1 : 0 } : item));
    setPendingGuestIds((current) => [...current, guestId]);
    try {
      const response = await requestRef.current("event/guest-presence", "PATCH", { eventId, guestId, present }, {}, true, false);
      if (!response?.status) setGuests(before);
    } finally {
      setPendingGuestIds((current) => current.filter((id) => id !== guestId));
    }
  };

  return (
    <Dialog
      aria-label={`Guest list for ${event.title || "event"}`}
      className="guest-list-modal"
      contentClassName="guest-list-modal__body"
      dismissableMask
      header={<div><h2>Guest list</h2><p>{event.title || "Event"}</p></div>}
      onHide={onHide}
      visible={visible}
    >
      {loading ? <div className="guest-list__skeleton" aria-hidden="true"><Skeleton height="2.5rem" /><Skeleton height="2.5rem" /><Skeleton height="2.5rem" /></div> : (
        <GuestListTable columns={columns} editable guests={guests} onPresenceChange={updatePresence} pendingGuestIds={pendingGuestIds} />
      )}
      <p className="guest-list__sync-note">Changes appear immediately. The guest list is saved now and synchronized with the regional spreadsheet in the background.</p>
    </Dialog>
  );
};

GuestListModal.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  onHide: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default GuestListModal;
