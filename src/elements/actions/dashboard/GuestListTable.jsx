import moment from "moment";
import PropTypes from "prop-types";
import InfoHint from "@/elements/ui/icons/InfoHint";

const TYPE_LABELS = {
  active_member: "Active member",
  guest: "Guest",
  member: "Member",
};

const typeKey = (type) => String(type || "guest").trim().toLowerCase().replaceAll(" ", "_");

const guestId = (guest) => String(guest.id || guest._id || "");

const formatPreferenceValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};

const GuestPreferences = ({ preferences }) => {
  const answers = Object.entries(preferences || {}).filter(([, value]) =>
    Array.isArray(value) ? value.length : value !== undefined && value !== null && value !== ""
  );

  if (!answers.length) return "—";

  return (
    <dl className="guest-list__preferences">
      {answers.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{formatPreferenceValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
};

GuestPreferences.propTypes = { preferences: PropTypes.object };

const GuestAddOns = ({ addOns }) => {
  const choices = (addOns || []).map((addOn) => addOn.title).filter(Boolean);
  return choices.length ? <span className="guest-list__add-ons">{choices.join(", ")}</span> : "—";
};

GuestAddOns.propTypes = {
  addOns: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
};

const GuestTypeBadge = ({ type }) => {
  const key = typeKey(type);
  return <span className={`guest-list__type guest-list__type--${key}`}>{TYPE_LABELS[key] || type || "Guest"}</span>;
};

GuestTypeBadge.propTypes = { type: PropTypes.string };

const GuestListTable = ({ columns = {}, guests, editable = false, onPresenceChange, pendingGuestIds = [] }) => {
  if (!guests.length) return <p className="guest-list__empty">No tickets have been issued for this event.</p>;

  const pending = new Set(pendingGuestIds);

  return (
    <div className="guest-list__table-wrap">
      <table className="guest-list__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            {columns.preferences && <th>Preferences</th>}
            {columns.addOns && <th>Add-ons</th>}
            <th>
              <span className="guest-list__presence-heading">
                Presence
                <InfoHint
                  label="About presence controls"
                  text="Click Present or Missing to toggle this guest’s attendance. The change saves immediately and syncs to the spreadsheet in the background."
                />
              </span>
            </th>
            <th>Purchased</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, index) => {
            const id = guestId(guest);
            const isPresent = Number(guest.status) === 1;
            const isRefunded = Boolean(guest.refunded);
            const isPending = pending.has(id);
            return (
              <tr key={id || `${guest.email}-${index}`} data-refunded={isRefunded || undefined}>
                <td>{guest.name || "—"}</td>
                <td><a href={`mailto:${guest.email}`}>{guest.email || "—"}</a></td>
                <td><GuestTypeBadge type={guest.type} /></td>
                {columns.preferences && <td><GuestPreferences preferences={guest.preferences} /></td>}
                {columns.addOns && <td><GuestAddOns addOns={guest.addOns} /></td>}
                <td>
                  {isRefunded ? <span className="guest-list__presence guest-list__presence--refunded">Refunded</span> : editable ? (
                    <button
                      aria-busy={isPending || undefined}
                      aria-pressed={isPresent}
                      className={`guest-list__presence guest-list__presence--${isPresent ? "present" : "missing"}`}
                      disabled={isPending || !id}
                      onClick={() => onPresenceChange?.(guest)}
                      title={isPresent ? "Mark as missing" : "Mark as present"}
                      type="button"
                    >
                      {isPending ? "Saving…" : isPresent ? "Present" : "Missing"}
                    </button>
                  ) : <span className={`guest-list__presence guest-list__presence--${isPresent ? "present" : "missing"}`}>{isPresent ? "Present" : "Missing"}</span>}
                </td>
                <td>{guest.timestamp ? moment(guest.timestamp).format("DD MMM YYYY") : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

GuestListTable.propTypes = {
  columns: PropTypes.shape({
    addOns: PropTypes.bool,
    preferences: PropTypes.bool,
  }),
  editable: PropTypes.bool,
  guests: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    email: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    preferences: PropTypes.object,
    refunded: PropTypes.bool,
    status: PropTypes.number,
    timestamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.string,
    addOns: PropTypes.arrayOf(PropTypes.shape({
      price: PropTypes.number,
      title: PropTypes.string,
    })),
  })).isRequired,
  onPresenceChange: PropTypes.func,
  pendingGuestIds: PropTypes.arrayOf(PropTypes.string),
};

export default GuestListTable;
