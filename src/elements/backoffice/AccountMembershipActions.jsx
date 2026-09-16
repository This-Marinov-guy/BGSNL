"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "@/redux/notification";
import Loader from "@/elements/ui/loading/Loader";
import styles from "./backoffice.module.scss";

const displayDate = value => value ? new globalThis.Intl.DateTimeFormat("en-GB", {
  dateStyle: "long", timeZone: "Europe/Amsterdam",
}).format(new Date(value)) : "the end of the current billing period";

export default function AccountMembershipActions({ account, disabled, onBusyChange, onChanged }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [transferSent, setTransferSent] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const targetLabel = account.type === "member" ? "Alumni" : "Member";
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;
  const dispatch = useDispatch();
  const endpoint = `backoffice/accounts/${account.type}/${encodeURIComponent(account.id)}`;
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true);
    setConfirmCancel(false);
    const response = await requestRef.current(`${endpoint}/membership`, "GET", null, {}, true, false);
    if (current !== sequence.current) return;
    setDetails(response || null);
    setLoading(false);
  }, [endpoint]);
  useEffect(() => { load(); return () => { sequence.current++; }; }, [load]);

  const cancel = async () => {
    if (inFlight.current || disabled || !confirmCancel || !details?.canCancel) return;
    inFlight.current = true;
    setPending(true);
    setPendingAction("cancel");
    onBusyChange(true);
    try {
      const response = await requestRef.current(`${endpoint}/cancel-subscription`, "POST", {
        confirmation: details.confirmation,
      }, {}, true, false);
      if (response?.cancelled) {
        dispatch(showNotification({ severity: "success", detail: `Renewal cancelled. Paid access continues until ${displayDate(response.cancelAt)}.` }));
        onChanged();
      } else await load();
    } finally { inFlight.current = false; setPending(false); onBusyChange(false); }
  };

  const requestTransfer = async () => {
    if (inFlight.current || disabled || !confirmTransfer) return;
    inFlight.current = true;
    setPending(true);
    setPendingAction("transfer");
    onBusyChange(true);
    try {
      const response = await requestRef.current(`${endpoint}/transfer`, "POST", {}, {}, true, false);
      if (response?.requested) {
        setTransferSent(true);
        setConfirmTransfer(false);
        dispatch(showNotification({ severity: "success", detail: response.message }));
      }
    } finally { inFlight.current = false; setPending(false); onBusyChange(false); }
  };

  return <section className={styles.membershipActions} aria-label="Membership management" aria-busy={pending}>
    <h3>Membership management</h3>
    {disabled && <p className={styles.selfNotice}>Save your profile changes before managing membership.</p>}
    <div className={styles.membershipAction}>
      <h4>Transfer to {targetLabel}</h4>
      <p>Send the account holder a link to choose their {targetLabel} plan and confirm any billing change after signing in.</p>
      {transferSent ? <p role="status">Transfer email queued. The account changes after its owner confirms the new plan.</p> : !confirmTransfer ?
        <button type="button" className={styles.secondaryButton} disabled={disabled || pending || !details?.canTransfer} onClick={() => { setConfirmTransfer(true); setConfirmCancel(false); }}>Send transfer link</button> :
        <div className={styles.actionConfirmation}>
          <p>Send the transfer request to <strong>{account.email}</strong>? Their current membership and subscription will stay unchanged until they confirm.</p>
          <div className={styles.actionButtons}>
            <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => setConfirmTransfer(false)}>Back</button>
            <button type="button" className={styles.primaryButton} disabled={disabled || pending} onClick={requestTransfer}>{pending && pendingAction === "transfer" ? "Sending…" : `Request transfer to ${targetLabel}`}</button>
          </div>
        </div>}
    </div>
    {loading ? <p role="status">Loading subscription…</p> : !details ? <div role="alert"><p>Membership details could not be loaded.</p><button type="button" className={styles.secondaryButton} onClick={load}>Retry</button></div> : <>
      <div className={styles.membershipAction}>
        <h4>Cancel subscription</h4>
        {details.canCancel ? <>
          <p>Stop renewal. Paid access continues until {displayDate(details.subscription.currentPeriodEnd)}.</p>
          {!confirmCancel ? <button type="button" className={styles.dangerButton} disabled={disabled || pending} onClick={() => { setConfirmCancel(true); setConfirmTransfer(false); }}>Cancel subscription</button> : <div className={styles.actionConfirmation}>
            <p>Cancel renewal for <strong>{account.name} {account.surname}</strong> ({account.email})?</p>
            <p>This does not refund previous payments or settle outstanding invoices.</p>
            <div className={styles.actionButtons}>
              <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => setConfirmCancel(false)}>Keep subscription</button>
              <button type="button" className={styles.dangerButton} disabled={disabled || pending} onClick={cancel}>{pending ? <><Loader /><span>Cancelling…</span></> : "Confirm cancellation"}</button>
            </div>
          </div>}
        </> : <><p>{details.cancellationReason}</p>{details.billingUnavailable && <button type="button" className={styles.secondaryButton} disabled={pending || loading} onClick={load}>Retry subscription check</button>}</>}
      </div>
    </>}
  </section>;
}
AccountMembershipActions.propTypes = {
  account: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onBusyChange: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
};
