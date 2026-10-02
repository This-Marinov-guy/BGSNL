"use client";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./event-campaign.module.scss";

const kinds = [["announcement", "Event announcement"], ["last-chance", "Last chance to book"], ["limited-offer", "Limited offer"]];
const audiences = [["members", "Members"], ["guests", "Guests"], ["both", "Both"]];
const labelRegion = region => region.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

export default function EventCampaignModal({ event, open, onClose, initialKind = "announcement" }) {
  const { sendRequest } = useHttpClient();
  const [kind, setKind] = useState(initialKind);
  const [audience, setAudience] = useState("both");
  const [promoCode, setPromoCode] = useState("");
  const [step, setStep] = useState("choose");
  const [preview, setPreview] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [campaign, setCampaign] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [statusRefresh, setStatusRefresh] = useState(0);
  const requestId = useRef(null);
  const submitLock = useRef(false);
  const eventId = event.id || event._id;
  useEffect(() => {
    if (!open) return;
    setKind(initialKind); setAudience("both"); setPromoCode(""); setStep("choose"); setCampaign(null); setConfirmation(""); setError("");
    requestId.current = null;
  }, [open, eventId, initialKind]);
  useEffect(() => {
    if (!open || campaign) return;
    const controller = new AbortController();
    setPending(true); setPreview(null); setError(""); setStep("choose"); setConfirmation(""); requestId.current = null;
    sendRequest(`event/${eventId}/campaigns/preview`, "POST", { kind, audience, promoCode }, {}, false, false, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (result?.preview) { setPreview(result.preview); setEnabled(result.sendingEnabled); }
        else setError("We couldn't review this campaign. Check your access and connection, then try again.");
        setPending(false);
      });
    return () => controller.abort();
  }, [open, eventId, kind, audience, promoCode, refresh, campaign, sendRequest]);
  useEffect(() => {
    if (!open || !campaign?.id) return;
    const controller = new AbortController();
    const poll = async () => {
      const result = await sendRequest(`event/${eventId}/campaigns/${campaign.id}`, "GET", null, {}, false, false, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setStatusError(!result?.campaign);
      if (result?.campaign) setCampaign(current => ({ ...current, ...result.campaign }));
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [open, campaign?.id, eventId, sendRequest, statusRefresh]);
  const confirm = async () => {
    if (submitLock.current || !preview || preview.blocked || !preview.total || confirmation !== "SEND") return;
    submitLock.current = true; setSending(true); setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      const result = await sendRequest(`event/${eventId}/campaigns/confirm`, "POST", { kind, audience, promoCode, review: preview.review, requestId: requestId.current }, {}, false, false);
      if (result?.campaign) setCampaign(result.campaign);
      else setError("We couldn't confirm this campaign. It may have changed since review. Retry safely, or go back and review the latest details.");
    } finally { submitLock.current = false; setSending(false); }
  };
  const button = (label, onClick, disabled = false, primary = false) => <button type="button" className={`event-form-button event-form-button--${primary ? "primary" : "ghost"}`} onClick={onClick} disabled={disabled}>{label}</button>;
  return <AppModal open={open} onClose={onClose} title={`Emails — ${event.title || "Event"}`} closable={!sending} maximizable={false}
    className={styles.modal} actions={campaign ? button("Done", onClose) : <>
      {button(step === "review" ? "Back to selection" : "Cancel", () => { if (step === "review") { setStep("choose"); setRefresh(value => value + 1); } else onClose(); }, sending)}
      {step === "choose" ? button("Review campaign", () => setStep("review"), pending || !preview || preview.blocked || !preview.total, true)
        : button(sending ? <><span className="event-form-button__spinner" aria-hidden="true" />Queuing…</> : `Confirm and queue ${preview?.total || 0} emails`, confirm, sending || confirmation !== "SEND" || !enabled, true)}
    </>}>
    <div className={styles.content} aria-busy={pending || sending}>
      {campaign ? <div role="status">
        <h3>Campaign {campaign.status.replaceAll("-", " ")}</h3>
        <p>{campaign.total} recipients were approved. Buyers, opt-outs and availability are checked again before each email.</p>
        {campaign.counts && <p>{campaign.counts.accepted || 0} accepted by the mailer · {campaign.counts.skipped || 0} skipped · {campaign.counts.failed || 0} unconfirmed</p>}
        {statusError && <LoadErrorBanner message="We couldn't refresh delivery progress. The campaign may still be processing; don't send it again." onRetry={() => setStatusRefresh(value => value + 1)} />}
        {campaign.status === "stopped" && <p>The event or offer changed, so remaining emails were stopped. Contact an administrator before retrying this campaign.</p>}
        {campaign.status === "completed-with-errors" && <p>Some deliveries could not be confirmed after retries. Contact an administrator; do not resend them as a new campaign.</p>}
      </div> : <>
        <ol className={styles.steps} aria-label="Campaign steps"><li aria-current={step === "choose" ? "step" : undefined}>1. Choose campaign</li><li aria-current={step === "review" ? "step" : undefined}>2. Review and confirm</li></ol>
        {step === "choose" && <>
          <fieldset><legend>Campaign</legend><div className={styles.options}>{kinds.map(([value, label]) => <label key={value}><input type="radio" name="event-campaign-kind" checked={kind === value} onChange={() => setKind(value)} />{label}</label>)}</div></fieldset>
          <fieldset><legend>Audience</legend><div className={styles.options}>{audiences.map(([value, label]) => <label key={value}><input type="radio" name="event-campaign-audience" checked={audience === value} onChange={() => setAudience(value)} />{label}</label>)}</div></fieldset>
          {kind === "limited-offer" && <label className={styles.field}>Promo code to advertise (optional)<select value={promoCode} onChange={event => setPromoCode(event.target.value)} disabled={pending}>
            <option value="">Current price / automatic offers only</option>{[...new Set([...(preview?.promoCodes || []), ...(promoCode ? [promoCode] : [])])].map(code => <option key={code} value={code}>{code}</option>)}
          </select></label>}
          <p>Members receive a personal checkout link. Guests receive an invitation to become a member. The last-chance reminder also runs automatically 24 hours before the event.</p>
        </>}
        {pending && <LoadingSkeleton label="Reviewing campaign audience" count={3} />}
        {error && <LoadErrorBanner message={error} onRetry={step === "review" ? confirm : () => setRefresh(value => value + 1)} disabled={sending} />}
        {preview && <>
          {preview.warnings.map(warning => <p key={warning} className={`${styles.notice} ${styles.warning}`} role="status"><FiInfo aria-hidden="true" />{warning}</p>)}
          {!enabled && <p className={styles.notice}>Sending is disabled in this environment. You can preview the campaign without sending emails.</p>}
          <p><strong>{preview.total} eligible recipients</strong> · {preview.counts.members} members · {preview.counts.guests} guests</p>
          <p>Regions: {preview.regions.map(labelRegion).join(", ")}</p>
          {!preview.total && <p className={styles.notice}>No eligible recipients remain for this campaign. Ticket holders, opt-outs and previously contacted recipients are excluded. Choose another campaign or audience.</p>}
          {step === "review" && <>
            <p>Review both versions below. Prices may vary by membership tier. Personal links are added at send time; all marketing emails include an unsubscribe link.</p>
            {preview.previews.map(item => <details key={item.audience} open><summary>{item.audience === "members" ? "Member" : "Guest"} email — {item.subject}</summary>
              <iframe className={styles.preview} title={`${item.audience} email preview`} sandbox="" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"></head><body style="font:16px/1.6 Arial,sans-serif;padding:16px">${item.html}</body></html>`} />
            </details>)}
            <label className={styles.field}>Type SEND to confirm<input value={confirmation} autoComplete="off" onChange={event => setConfirmation(event.target.value)} disabled={sending} /></label>
            <p>Emails cannot be recalled once sent.</p>
          </>}
        </>}
      </>}
    </div>
  </AppModal>;
}
EventCampaignModal.propTypes = { event: PropTypes.object.isRequired, open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, initialKind: PropTypes.oneOf(kinds.map(([kind]) => kind)) };
