import { Dialog, Skeleton } from "@/compat/primereact";
import GuestListTable from "../GuestListTable";
import GuestListSearch from "../GuestListSearch";
import { useLiveGuestList } from "@/hooks/common/use-live-guest-list";
import PropTypes from "prop-types";
import { IconlyQrCode, IconlyDocument } from "@/elements/ui/icons/IconlyIcons";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { showNotification } from "@/redux/notification";
import { selectUser } from "@/redux/user";
import { ACCESS_3, EVENT_MANAGEMENT_ACCESS } from "@/util/defines/common";
import { checkAuthorization } from "@/util/functions/authorization";
import InfoHint from "@/elements/ui/icons/InfoHint";

const money = (cents, currency = "EUR") => new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency }).format(cents / 100);
const parseEuroCents = value => {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(?:\.\d{1,2})?$/.test(normalized) ? Math.round(Number(normalized) * 100) : null;
};

const AnimatedMoney = ({ cents, currency }) => {
  const reducedMotion = useReducedMotion();
  const animatedCents = useSpring(cents, { stiffness: 280, damping: 32 });
  const formatter = useMemo(() => new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency }), [currency]);
  const formatted = useTransform(animatedCents, value => formatter.format(Math.max(0, Math.round(value)) / 100));

  useEffect(() => {
    if (reducedMotion) animatedCents.jump(cents);
    else animatedCents.set(cents);
  }, [animatedCents, cents, reducedMotion]);

  return <><motion.span aria-hidden="true">{formatted}</motion.span><span className="visually-hidden">{money(cents, currency)}</span></>;
};

AnimatedMoney.propTypes = { cents: PropTypes.number.isRequired, currency: PropTypes.string.isRequired };

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
  const { guests, columns, loading, syncError, live, pendingGuestIds, updatePresence, applyGuestUpdate, removeGuest } = useLiveGuestList(eventId, visible);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const canEdit = checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS);
  const canRefund = checkAuthorization(user.session, ACCESS_3);
  const [editGuest, setEditGuest] = useState(null);
  const [editFields, setEditFields] = useState({ name: "", email: "", phone: "" });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [refundGuest, setRefundGuest] = useState(null);
  const [refundQuote, setRefundQuote] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [includeFee, setIncludeFee] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [deleteGuest, setDeleteGuest] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const refundRequest = useRef(0);
  const presentCount = guests.filter((guest) => Number(guest.status) === 1 && !guest.refunded).length;
  const openScanner = () => {
    const url = new URL("/user/dashboard/ticket-scanner", window.location.origin);
    url.searchParams.set("forEvent", eventId);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const closeGuestList = () => {
    onHide();
  };

  const openEdit = guest => {
    setEditGuest(guest);
    setEditFields({ name: guest.name || "", email: guest.email || "", phone: guest.phone || "" });
    setEditError("");
  };

  const saveEdit = async submitEvent => {
    submitEvent.preventDefault();
    if (!editGuest || editBusy) return;
    setEditBusy(true);
    setEditError("");
    try {
      const guestId = editGuest.id || editGuest._id;
      const response = await browserFetch(`/api/event/guest-list/${eventId}/guests/${guestId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(Object.entries(editFields).map(([key, value]) => [key, value.trim()]))),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not save attendee details. Please try again.");
      applyGuestUpdate(data.guest);
      setEditGuest(null);
      dispatch(showNotification({ severity: "success", summary: "Attendee updated" }));
    } catch (error) { setEditError(error.message || "Could not save attendee details. Please try again."); }
    finally { setEditBusy(false); }
  };

  const loadRefundQuote = async guest => {
    const request = ++refundRequest.current;
    setRefundLoading(true);
    setRefundError("");
    try {
      const response = await browserFetch(`/api/event/guest-list/${eventId}/guests/${guest.id || guest._id}/refund`, {
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load the payment details. Try again.");
      if (request !== refundRequest.current) return;
      setRefundQuote(data.quote);
      setRefundAmount((data.quote.remainingCents / 100).toFixed(2));
    } catch (error) {
      if (request === refundRequest.current) setRefundError(error.message || "Could not load the payment details. Try again.");
    } finally { if (request === refundRequest.current) setRefundLoading(false); }
  };

  const openRefund = guest => {
    setRefundGuest(guest);
    setRefundQuote(null);
    setRefundAmount("");
    setRefundReason("");
    setIncludeFee(false);
    void loadRefundQuote(guest);
  };

  const closeRefund = () => {
    if (refundBusy) return;
    refundRequest.current++;
    setRefundGuest(null);
  };

  const amountCents = parseEuroCents(refundAmount);
  const validAmount = refundQuote && amountCents > 0 && amountCents <= refundQuote.remainingCents;
  const feeDeductionCents = validAmount && !includeFee
    ? Math.round(refundQuote.feeCents * amountCents / refundQuote.amountCents) : 0;
  const refundNetCents = validAmount ? amountCents - feeDeductionCents : 0;

  const submitRefund = async submitEvent => {
    submitEvent.preventDefault();
    if (!refundGuest || !refundQuote || !validAmount || refundNetCents <= 0 || refundBusy) return;
    setRefundBusy(true);
    setRefundError("");
    try {
      const guestId = refundGuest.id || refundGuest._id;
      const response = await browserFetch(`/api/event/guest-list/${eventId}/guests/${guestId}/refund`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, reason: refundReason.trim(), includeFee }),
        signal: AbortSignal.timeout(45000),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not complete the refund. Check Stripe before trying again.");
      data.guests.forEach(applyGuestUpdate);
      refundRequest.current++;
      setRefundGuest(null);
      dispatch(showNotification({ severity: "success", summary: `${money(data.refundAmountCents, refundQuote.currency)} refunded`,
        detail: `${data.affectedTicketCount} ticket${data.affectedTicketCount === 1 ? "" : "s"} marked refunded.` }));
      if (data.profileCleanupPending) dispatch(showNotification({ severity: "warn", summary: "Refund sent; account ticket cleanup needs attention" }));
    } catch (error) { setRefundError(error.message || "Could not complete the refund. Check Stripe before trying again."); }
    finally { setRefundBusy(false); }
  };

  const submitDelivery = async submitEvent => {
    submitEvent.preventDefault();
    if (!delivery || deliveryBusy) return;
    setDeliveryBusy(true);
    const { guest, kind } = delivery;
    const action = kind === "receipt" ? "receipt" : "ticket";
    try {
      const guestId = guest.id || guest._id;
      const response = await browserFetch(`/api/event/guest-list/${eventId}/guests/${guestId}/send-${action}`, {
        method: "POST", signal: AbortSignal.timeout(kind === "ticket" ? 120000 : 30000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.status) throw new Error(data.message || `Could not send the ${action}. Please try again.`);
      setDelivery(null);
      dispatch(showNotification({ severity: "success",
        summary: kind === "receipt" ? "Receipt email accepted" : "Ticket email accepted",
        detail: `Requested for ${data.email || guest.email}.` }));
    } catch (error) {
      dispatch(showNotification({ severity: "error", summary: `Could not send ${action}`,
        detail: error.name === "TimeoutError"
          ? `The request timed out. Check ${kind === "receipt" ? "the guest's inbox or Stripe" : "the guest's inbox"} before trying again.`
          : error.message || `Could not send the ${action}. Please try again.` }));
    } finally { setDeliveryBusy(false); }
  };

  const submitDelete = async submitEvent => {
    submitEvent.preventDefault();
    if (!deleteGuest || deleteBusy) return;
    setDeleteBusy(true);
    try {
      const guestId = deleteGuest.id || deleteGuest._id;
      const response = await browserFetch(`/api/event/guest-list/${eventId}/guests/${guestId}`, {
        method: "DELETE", signal: AbortSignal.timeout(30000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.status) throw new Error(data.message || "Could not delete this free ticket. Please try again.");
      removeGuest(guestId);
      setDeleteGuest(null);
      dispatch(showNotification({ severity: "success", summary: "Free ticket deleted",
        detail: `The ticket for ${deleteGuest.name || "this guest"} can no longer be used.` }));
    } catch (error) {
      dispatch(showNotification({ severity: "error", summary: "Could not delete ticket",
        detail: error.message || "Please try again." }));
    } finally { setDeleteBusy(false); }
  };

  return (
    <>
      <Dialog className="guest-list-delivery-modal" header="Delete free ticket" maximizable={false}
        visible={Boolean(deleteGuest)} onHide={() => { if (!deleteBusy) setDeleteGuest(null); }}>
        <form onSubmit={submitDelete}>
          <p>Delete the free ticket for <strong>{deleteGuest?.name || "this guest"}</strong>? It will be removed from the guest list and can no longer be scanned. This cannot be undone.</p>
          <div className="guest-list__form-actions">
            <button type="button" autoFocus onClick={() => setDeleteGuest(null)} disabled={deleteBusy}>Keep ticket</button>
            <button type="submit" className="guest-list__refund-confirm" disabled={deleteBusy} aria-busy={deleteBusy}>
              {deleteBusy ? "Deleting…" : "Delete ticket"}
            </button>
          </div>
        </form>
      </Dialog>
      <Dialog className="guest-list-delivery-modal" header={delivery?.kind === "receipt" ? "Send Stripe receipt" : "Send ticket"}
        maximizable={false} visible={Boolean(delivery)} onHide={() => { if (!deliveryBusy) setDelivery(null); }}>
        <form onSubmit={submitDelivery}>
          <p>{delivery?.kind === "receipt"
            ? <>Email the Stripe receipt for this payment to <strong>{delivery.guest.email}</strong>. If other tickets were bought in the same payment, the receipt covers the full purchase.</>
            : <>Send the ticket email again to <strong>{delivery?.guest.email}</strong>.</>}</p>
          <div className="guest-list__form-actions">
            <button type="button" onClick={() => setDelivery(null)} disabled={deliveryBusy}>Cancel</button>
            <button type="submit" disabled={deliveryBusy} aria-busy={deliveryBusy}>
              {deliveryBusy ? "Sending…" : delivery?.kind === "receipt" ? "Send receipt" : "Send ticket"}
            </button>
          </div>
        </form>
      </Dialog>
      <Dialog className="guest-list-edit-modal" header="Edit attendee" maximizable={false}
        visible={Boolean(editGuest)} onHide={() => { if (!editBusy) setEditGuest(null); }}>
        <form className="guest-list__edit-form" onSubmit={saveEdit}>
          <div className="rn-form-group">
            <label htmlFor="edit-attendee-name">Name</label>
            <input className="bgsnl-form-control" id="edit-attendee-name" type="text" value={editFields.name} maxLength={160} required autoComplete="off"
              onChange={changeEvent => { setEditFields(fields => ({ ...fields, name: changeEvent.target.value })); setEditError(""); }} />
          </div>
          <div className="rn-form-group">
            <label htmlFor="edit-attendee-email">Email</label>
            <input className="bgsnl-form-control" id="edit-attendee-email" type="email" inputMode="email" value={editFields.email} maxLength={320} required autoComplete="off"
              onChange={changeEvent => { setEditFields(fields => ({ ...fields, email: changeEvent.target.value })); setEditError(""); }} />
          </div>
          <div className="rn-form-group">
            <label htmlFor="edit-attendee-phone">Phone</label>
            <input className="bgsnl-form-control" id="edit-attendee-phone" type="tel" inputMode="tel" value={editFields.phone} maxLength={50} required autoComplete="off"
              onChange={changeEvent => { setEditFields(fields => ({ ...fields, phone: changeEvent.target.value })); setEditError(""); }} />
          </div>
          {editError && <p className="guest-list__form-error" role="alert">{editError}</p>}
          <div className="guest-list__form-actions">
            <button type="button" onClick={() => setEditGuest(null)} disabled={editBusy}>Cancel</button>
            <button type="submit" disabled={editBusy} aria-busy={editBusy}>{editBusy ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </Dialog>
      <Dialog className="guest-list-refund-modal" header="Refund tickets" maximizable={false}
        visible={Boolean(refundGuest)} onHide={closeRefund}>
        <p>Refund the payment for <strong>{refundGuest?.name || "this attendee"}</strong>.</p>
        {refundLoading && <div className="guest-list__refund-skeleton" role="status">
          <span className="visually-hidden">Loading payment details…</span>
          <div aria-hidden="true" className="guest-list__refund-skeleton-content">
            <div className="guest-list__refund-skeleton-field"><Skeleton width="6rem" height="1.4rem" /><Skeleton height="3.125rem" /></div>
            <div className="guest-list__refund-skeleton-field"><Skeleton width="4rem" height="1.4rem" /><Skeleton height="6rem" /></div>
            <div className="guest-list__refund-skeleton-switch"><Skeleton width="8rem" height="1.5rem" /><Skeleton width="2.75rem" height="1.5rem" /></div>
            <Skeleton height="7.5rem" />
            <div className="guest-list__refund-skeleton-actions"><Skeleton width="7rem" height="2.75rem" /><Skeleton width="9rem" height="2.75rem" /></div>
          </div>
        </div>}
        {refundError && <div className="guest-list__form-error" role="alert"><p>{refundError}</p>
          {!refundQuote && <button type="button" onClick={() => loadRefundQuote(refundGuest)}>Retry loading payment</button>}</div>}
        {refundQuote && <form className="guest-list__refund-form" onSubmit={submitRefund}>
          {refundQuote.affectedTicketCount > 1 && <p className="guest-list__refund-group-note">This payment covers {refundQuote.affectedTicketCount} tickets. All of them will be marked refunded.</p>}
          <div className="rn-form-group">
            <label htmlFor="refund-ticket-amount">Amount ({refundQuote.currency})</label>
            <input className="bgsnl-form-control" id="refund-ticket-amount" type="text" inputMode="decimal" value={refundAmount} required autoComplete="off" disabled={refundBusy}
              aria-invalid={Boolean(refundAmount && !validAmount)} aria-describedby={refundAmount && !validAmount ? "refund-ticket-amount-error" : undefined}
              onChange={changeEvent => { setRefundAmount(changeEvent.target.value); setRefundError(""); }} />
            {!validAmount && refundAmount && <p id="refund-ticket-amount-error" className="guest-list__form-error" role="alert">Enter an amount from {money(1, refundQuote.currency)} to {money(refundQuote.remainingCents, refundQuote.currency)}.</p>}
          </div>
          <div className="rn-form-group">
            <label htmlFor="refund-ticket-reason">Reason</label>
            <textarea className="bgsnl-form-control" id="refund-ticket-reason" value={refundReason} required minLength={3} maxLength={500} autoComplete="off" disabled={refundBusy}
              onChange={changeEvent => { setRefundReason(changeEvent.target.value); setRefundError(""); }} />
          </div>
          <div className="guest-list__fee-choice event-ticket-switch-row">
            <span className="guest-list__fee-choice-label">
              <span>Include fee</span>
              <InfoHint label="About Stripe fees" text="Off: a proportional share of the Stripe processing fee is deducted from the entered amount. On: the customer receives the full entered amount and the Society covers the fee." />
            </span>
            <button id="refund-ticket-include-fee" type="button" role="switch" aria-checked={includeFee} aria-label="Include Stripe fee in refund"
              className="event-ticket-switch" disabled={refundBusy} onClick={() => { setIncludeFee(current => !current); setRefundError(""); }}><span aria-hidden="true" /></button>
          </div>
          {validAmount && <dl className="guest-list__refund-summary">
            <div><dt>Entered amount</dt><dd><AnimatedMoney cents={amountCents} currency={refundQuote.currency} /></dd></div>
            <div><dt>Stripe fee deducted</dt><dd><AnimatedMoney cents={feeDeductionCents} currency={refundQuote.currency} /></dd></div>
            <div><dt>Customer receives</dt><dd><AnimatedMoney cents={refundNetCents} currency={refundQuote.currency} /></dd></div>
          </dl>}
          <div className="guest-list__form-actions">
            <button type="button" onClick={closeRefund} disabled={refundBusy}>Keep tickets</button>
            <button type="submit" className="guest-list__refund-confirm" disabled={refundBusy || !validAmount || refundNetCents <= 0}
              aria-busy={refundBusy}>{refundBusy ? "Refunding…" : <>Refund {validAmount ? <AnimatedMoney cents={refundNetCents} currency={refundQuote.currency} /> : "payment"}</>}</button>
          </div>
        </form>}
      </Dialog>
      <Dialog
        aria-label={`Guest list for ${event.title || "event"}`}
        className={`guest-list-modal${extended ? " guest-list-modal--extended" : ""}`}
        contentClassName="guest-list-modal__body"
        dismissableMask
        suspended={Boolean(editGuest || refundGuest || delivery || deleteGuest)}
        header={<div>
          <h2>Guest list{!loading && !syncError && <> <span aria-label={`${presentCount} present out of ${guests.length} guests`}>({presentCount} / {guests.length})</span></>}</h2>
          <p title={event.title || "Event"}>{event.title || "Event"}</p>
        </div>}
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
          <GuestListTable columns={columns} search={search} extended={extended} editable guests={guests}
            onPresenceChange={updatePresence} onEdit={canEdit ? openEdit : undefined}
            onRefund={canRefund ? openRefund : undefined} canRefund={canRefund}
            onDelete={canRefund ? setDeleteGuest : undefined}
            onSendTicket={canEdit ? guest => setDelivery({ kind: "ticket", guest }) : undefined}
            onSendReceipt={canRefund ? guest => setDelivery({ kind: "receipt", guest }) : undefined}
            pendingGuestIds={pendingGuestIds} />
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
