import { formatDisplayDate } from "@/util/functions/display-date.mjs";
import { useEffect, useId, useRef } from "react";
import PropTypes from "prop-types";
import InfoHint from "@/elements/ui/icons/InfoHint";
import { IconlyTicket, IconlyChat, IconlyCall } from "@/elements/ui/icons/IconlyIcons";
import { filterGuestList } from "@/util/functions/guest-list-search.mjs";

const ticketHref = value => {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};

const TYPE_LABELS = {
  active_member: "Active member",
  alumni: "Alumni",
  guest: "Guest",
  member: "Member",
};

const typeKey = (type) => String(type || "guest").trim().toLowerCase().replaceAll(" ", "_");

const guestId = (guest) => String(guest.id || guest._id || "");

const GuestContact = ({ email, phone, name, extended }) => {
  const menuId = useId();
  const menuRef = useRef(null);
  const cleaned = String(phone || "").replace(/[\s().-]/g, "");
  const dial = /^\+?\d{6,15}$/.test(cleaned) ? cleaned : null;
  const international = dial?.startsWith("+") ? dial.slice(1) : dial?.startsWith("00") ? dial.slice(2) : null;
  const positionMenu = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!menuRef.current) return;
    menuRef.current.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - 184))}px`;
    menuRef.current.style.top = `${bounds.bottom + 116 > window.innerHeight ? Math.max(8, bounds.top - 116) : bounds.bottom + 6}px`;
  };
  return <div className="guest-list__contact">
    {email ? <a href={`mailto:${email}`}>{email}</a> : <span>—</span>}
    {extended && <div className="guest-list__phone">
      <span>{phone || "—"}</span>
      {dial && <>
        {/* React 19 uses camelCase for the native popover target. */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <button className="guest-list__contact-button" type="button" popoverTarget={menuId} onClick={positionMenu} aria-label={`Contact ${name || phone}`} title="Call or WhatsApp"><IconlyChat aria-hidden="true" /></button>
        <div id={menuId} ref={menuRef} popover="auto" className="guest-list__contact-menu">
          <a href={`tel:${dial}`} onClick={() => menuRef.current?.hidePopover()}><IconlyCall aria-hidden="true" />Call</a>
          {international ? <a href={`https://wa.me/${international}`} target="_blank" rel="noopener noreferrer" onClick={() => menuRef.current?.hidePopover()}><IconlyChat aria-hidden="true" />WhatsApp</a> : <span title="An international country code is required">WhatsApp unavailable</span>}
        </div>
      </>}
    </div>}
  </div>;
};
GuestContact.propTypes = { email: PropTypes.string, phone: PropTypes.string, name: PropTypes.string, extended: PropTypes.bool };

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

const GuestActions = ({ guest, onEdit, onRefund, canRefund }) => {
  const menuId = useId();
  const menuRef = useRef(null);
  const refunded = Boolean(guest.refunded);
  const hasPayment = Boolean(guest.transactionId && guest.transactionId !== "-");
  const positionMenu = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!menuRef.current) return;
    menuRef.current.style.left = `${Math.max(8, Math.min(bounds.right - 176, window.innerWidth - 184))}px`;
    menuRef.current.style.top = `${bounds.bottom + 112 > window.innerHeight ? Math.max(8, bounds.top - 112) : bounds.bottom + 6}px`;
  };
  const select = action => { menuRef.current?.hidePopover(); action(guest); };
  return <div className="guest-list__row-actions">
    {/* React 19 supports the native popover target as a camel-cased property. */}
    {/* eslint-disable-next-line react/no-unknown-property */}
    <button type="button" className="guest-list__more" popoverTarget={menuId} onClick={positionMenu}
      aria-label={`Actions for ${guest.name || "guest"}`} title="Guest actions">⋮</button>
    <div id={menuId} ref={menuRef} popover="auto" className="guest-list__row-menu">
      <button type="button" onClick={() => select(onEdit)}>Edit</button>
      {canRefund && onRefund && <button type="button" className="guest-list__row-menu-refund"
        disabled={refunded || !hasPayment}
        onClick={() => select(onRefund)}>{refunded ? "Already refunded" : !hasPayment ? "No payment to refund" : "Refund"}</button>}
    </div>
  </div>;
};
GuestActions.propTypes = { guest: PropTypes.object.isRequired, onEdit: PropTypes.func.isRequired,
  onRefund: PropTypes.func, canRefund: PropTypes.bool };

const GuestListTable = ({ columns = {}, guests, search = "", extended = false, editable = false, onPresenceChange,
  onEdit, onRefund, canRefund = false, pendingGuestIds = [] }) => {
  const tableRef = useRef(null);
  const previousExtended = useRef(extended);
  useEffect(() => {
    if (previousExtended.current === extended) return undefined;
    previousExtended.current = extended;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = tableRef.current?.animate?.(
      [{ opacity: reduced ? 0.9 : 0.65 }, { opacity: 1 }],
      { duration: reduced ? 80 : 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    );
    return () => animation?.cancel();
  }, [extended]);
  if (!guests.length) return <p className="guest-list__empty">No tickets have been issued for this event.</p>;

  const pending = new Set(pendingGuestIds);
  const matches = filterGuestList(guests, search);
  const columnCount = 5 + Number(Boolean(onEdit)) + (extended ? 2 + Number(Boolean(columns.preferences)) + Number(Boolean(columns.addOns)) : 0);

  return (
    <div className="guest-list__table-wrap">
      <table className="guest-list__table" ref={tableRef} role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th className="guest-list__name-column" role="columnheader" scope="col">Name</th>
            <th role="columnheader" scope="col">{extended ? "Contact" : "Email"}</th>
            {extended && columns.preferences && <th className="guest-list__preferences-column" role="columnheader" scope="col">Preferences</th>}
            {extended && columns.addOns && <th role="columnheader" scope="col">Add-ons</th>}
            <th role="columnheader" scope="col">Type</th>
            <th role="columnheader" scope="col">
              <span className="guest-list__presence-heading">
                Presence
                <InfoHint
                  label="About presence controls"
                  text="Click Present or Missing to toggle this guest’s attendance. The change saves immediately and syncs to the spreadsheet in the background."
                />
              </span>
            </th>
            <th role="columnheader" scope="col">Purchased</th>
            {extended && <><th role="columnheader" scope="col">Ticket</th><th role="columnheader" scope="col">Transaction ID</th></>}
            {onEdit && <th className="guest-list__actions-column" role="columnheader" scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {!matches.length && <tr role="row"><td colSpan={columnCount} role="cell"><span role="status">No guests match your search.</span></td></tr>}
          {matches.map((guest, index) => {
            const id = guestId(guest);
            const isPresent = Number(guest.status) === 1;
            const isRefunded = Boolean(guest.refunded);
            const isPending = pending.has(id);
            const ticketUrl = ticketHref(guest.ticket);
            return (
              <tr key={id || `${guest.email}-${index}`} data-refunded={isRefunded || undefined} role="row">
                <td className="guest-list__name-column" data-label="Name" role="cell">{guest.name || "—"}</td>
                <td className="guest-list__contact-cell" data-label={extended ? "Contact" : "Email"} role="cell"><GuestContact email={guest.email} phone={guest.phone} name={guest.name} extended={extended} /></td>
                {extended && columns.preferences && <td className="guest-list__preferences-column" data-label="Preferences" role="cell"><GuestPreferences preferences={guest.preferences} /></td>}
                {extended && columns.addOns && <td className="guest-list__add-ons-cell" data-label="Add-ons" role="cell"><GuestAddOns addOns={guest.addOns} /></td>}
                <td className="guest-list__type-cell" data-label="Type" role="cell"><GuestTypeBadge type={guest.type} /></td>
                <td className="guest-list__presence-cell" data-label="Presence" role="cell">
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
                <td className="guest-list__purchased-cell" data-label="Purchased" role="cell">{guest.timestamp ? formatDisplayDate(guest.timestamp) : "—"}</td>
                {extended && <>
                  <td className="guest-list__ticket-cell" data-label={ticketUrl ? undefined : "Ticket"} role="cell">{ticketUrl ? <a className="guest-list__ticket-link" href={ticketUrl} target="_blank" rel="noopener noreferrer"><IconlyTicket aria-hidden="true" /><span>Ticket</span></a> : "—"}</td>
                  <td className="guest-list__transaction-cell" data-label="Transaction ID" role="cell">{guest.transactionId || "—"}</td>
                </>}
                {onEdit && <td className="guest-list__actions-column" data-label="Actions" role="cell"><GuestActions guest={guest} onEdit={onEdit} onRefund={onRefund} canRefund={canRefund} /></td>}
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
  extended: PropTypes.bool,
  search: PropTypes.string,
  guests: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    email: PropTypes.string,
    phone: PropTypes.string,
    ticket: PropTypes.string,
    transactionId: PropTypes.string,
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
  onEdit: PropTypes.func,
  onRefund: PropTypes.func,
  canRefund: PropTypes.bool,
  pendingGuestIds: PropTypes.arrayOf(PropTypes.string),
};

export default GuestListTable;
