"use client";
import RetryIcon from "@/elements/ui/icons/RetryIcon";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ProgressSpinner, SelectInput } from "@/compat/primereact";
import { useDispatch } from "react-redux";
import { showNotification } from "@/redux/notification";
import { IconlyArrowLeft, IconlySend } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { attachReportScreenshot, startReportScreenshot } from "./support-screenshot.mjs";
import { createGuestAccess, forgetGuestReport, rememberGuestReport, SUPPORT_TYPE_LABELS } from "./support-state.mjs";
import styles from "./support.module.scss";
import AttachmentDropzone from "./AttachmentDropzone";
import VladiImage from "@/elements/ui/media/VladiImage";

function browserName(userAgent) {
  if (/Edg\//.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//.test(userAgent)) return "Opera";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Unknown browser";
}

function clientEnvironment() {
  const userAgent = navigator.userAgent || "";
  const mobile = /Mobi|Android|iPhone|iPod/i.test(userAgent);
  const tablet = /iPad|Tablet/i.test(userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(userAgent));
  const viewport = window.visualViewport;
  return {
    browser: browserName(userAgent),
    platform: navigator.userAgentData?.platform || navigator.platform || "Unknown platform",
    deviceType: tablet ? "Tablet" : mobile ? "Mobile" : "Desktop",
    language: navigator.language || "",
    timezone: globalThis.Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    viewport: { width: Math.round(viewport?.width || window.innerWidth), height: Math.round(viewport?.height || window.innerHeight) },
    screen: { width: Math.round(window.screen?.width || 0), height: Math.round(window.screen?.height || 0) },
    devicePixelRatio: window.devicePixelRatio || 1,
    touchPoints: navigator.maxTouchPoints || 0,
  };
}

export default function ReportForm({ session, profile, onCreated, onBack, active, initialType = "problem" }) {
  const id = useId();
  const [type, setType] = useState(initialType);
  const [slideDirection, setSlideDirection] = useState(null);
  const recommendation = type === "recommendation";
  const dispatch = useDispatch();
  const [contactMethod, setContactMethod] = useState("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formReady, setFormReady] = useState(false);
  const [files, setFiles] = useState([]);
  const pending = useRef(null);
  const formRef = useRef(null);
  const heading = useRef(null);
  const submitting = useRef(false);

  function changeType(nextType) {
    if (nextType === type || busy || pending.current) return;
    setSlideDirection(nextType === "recommendation" ? "forward" : "backward");
    setType(nextType);
  }

  const readFormReady = useCallback(() => {
    const form = formRef.current;
    if (!form) return false;
    const required = Array.from(form.querySelectorAll("[required]"));
    if (!required.every(field => field.value.trim() && field.validity.valid)) return false;
    if (!session) {
      const contact = form.elements.namedItem("contact")?.value.trim() || "";
      if (contactMethod === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const digits = contact.replace(/\D/g, "").length;
      return /^[+\d\s().-]+$/.test(contact) && digits >= 7 && digits <= 15;
    }
    return true;
  }, [session, contactMethod]);
  const updateFormReady = useCallback(() => setFormReady(readFormReady()), [readFormReady]);
  useEffect(updateFormReady, [updateFormReady, active]);

  useEffect(() => { if (active) heading.current?.focus({ preventScroll: true }); }, [active]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !active || (!pending.current && !readFormReady())) return;
    const form = new FormData(event.currentTarget);
    const data = { type, subject: String(form.get("subject") || ""), text: String(form.get("text") || ""),
      contact: session ? undefined : { name: String(form.get("name") || ""), [contactMethod]: String(form.get("contact") || "") },
      website: String(form.get("website") || ""), pagePath: window.location.pathname, environment: recommendation ? undefined : clientEnvironment() };
    // A failed/ambiguous submission must keep its identity and payload. Do not
    // turn Retry into a second conversation.
    if (!pending.current) {
      const access = session ? { id: crypto.randomUUID() } : createGuestAccess();
      pending.current = { access, data: { ...data, id: access.id }, files, attachmentId: crypto.randomUUID() };
    }
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const { access, data: payload } = pending.current;
      if (!session) rememberGuestReport(access);
      if (payload.type === "problem" && !pending.current.screenshot) {
        pending.current.screenshot = startReportScreenshot();
        pending.current.screenshotId = crypto.randomUUID();
      }
      const operation = pending.current;
      if (!operation.created) operation.created = await supportRequest("conversations", { session, secret: access.secret, data: payload });
      let result = operation.created;
      if (operation.files.length) {
        const upload = new FormData();
        upload.append("id", operation.attachmentId);
        upload.append("text", "");
        for (const file of operation.files) upload.append("images", file);
        result = await supportRequest(`conversations/${result.conversation.id}/messages`, { session, secret: access.secret, data: upload });
      }
      if (payload.type === "problem") void attachReportScreenshot({ screenshot: operation.screenshot, messageId: operation.screenshotId,
        conversationId: result.conversation.id, session, secret: access.secret }, supportRequest).then((attached) => {
        if (!attached) dispatch(showNotification({ severity: "info", detail: "Your report was sent, but the automatic screenshot could not be attached." }));
      }).catch(() => {
        dispatch(showNotification({ severity: "info", detail: "Your report was sent, but the automatic screenshot could not be attached." }));
      });
      pending.current = null;
      formRef.current?.reset();
      setFormReady(false);
      setFiles([]);
      onCreated(result.conversation);
    } catch (failure) {
      // Validation is a definite rejection, so fields can be corrected. Keep
      // the operation ID for network failures and server-unavailable responses.
      if (!pending.current?.created && [401, 403, 422, 429].includes(failure.status)) {
        if (!session) forgetGuestReport(pending.current.access.id);
        pending.current = null;
      }
      setError(pending.current?.created ? `Your report was created, but the attachments were not confirmed. ${failure.message}` : failure.message);
    } finally { submitting.current = false; setBusy(false); }
  }

  return <div className={styles.formView}>
    <button className={styles.textButton} type="button" onClick={onBack}><IconlyArrowLeft size="1.25rem" /> Your tickets</button>
    <div className={styles.requestTransition} data-direction={slideDirection || undefined} onAnimationEnd={event => { if (event.target === event.currentTarget) setSlideDirection(null); }}>
    <div className={styles.reportIntro}>
      <div>
        <p>{recommendation ? "Share an idea for events, membership or the website." : "Tell us what happened."} Don’t include passwords, payment details or sensitive documents.</p>
        <div className={`${styles.requestTypeInput} rn-form-group`}><label htmlFor={`${id}-type`}>Request type</label><SelectInput id={`${id}-type`} className="bgsnl-form-control" value={type} disabled={busy || !!pending.current} onChange={(event) => changeType(event.target.value)}>{Object.entries(SUPPORT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectInput></div>
      </div>
      <VladiImage className={styles.reportPortrait} src={`/assets/images/vladi/${recommendation ? "nice" : "explain2"}.png`} alt="" aria-hidden="true" sizes="128px" />
    </div>
    <form className={styles.form} onSubmit={submit} onInput={updateFormReady} onChange={updateFormReady} ref={formRef}>
      <fieldset disabled={busy || (!!error && !!pending.current)}>
        {session ? <p className={styles.identity}>Sending as <strong>{profile?.contact?.name || "your signed-in account"}</strong>{profile?.contact?.email && <small>{profile.contact.email}</small>}</p> : <>
          <div className="rn-form-group"><label htmlFor={`${id}-name`}>Your name</label><input className="bgsnl-form-control" id={`${id}-name`} name="name" autoComplete="name" maxLength={160} required /></div>
          <div className={styles.methodSwitch} aria-label="Contact method">
            {[["email", "Email"], ["phone", "Phone"]].map(([value, label]) => <button key={value} type="button" aria-pressed={contactMethod === value} onClick={() => setContactMethod(value)}>{label}</button>)}
          </div>
          <div className="rn-form-group"><label htmlFor={`${id}-contact`}>{contactMethod === "email" ? "Email address" : "Phone number"}</label><input key={contactMethod} className="bgsnl-form-control" id={`${id}-contact`} name="contact" type={contactMethod === "email" ? "email" : "tel"} autoComplete={contactMethod === "email" ? "email" : "tel"} maxLength={contactMethod === "email" ? 254 : 40} placeholder={contactMethod === "phone" ? "+31 …" : "you@example.com"} required /></div>
        </>}
        <div className="rn-form-group"><label htmlFor={`${id}-subject`}>{recommendation ? "What do you recommend?" : "What isn’t working?"}</label><input className="bgsnl-form-control" id={`${id}-subject`} name="subject" maxLength={140} placeholder={recommendation ? "A short title for your idea" : "A short description of the problem"} required /></div>
        <div className="rn-form-group"><label htmlFor={`${id}-message`}>{recommendation ? "Tell us more" : "What happened?"}</label><textarea className="bgsnl-form-control" id={`${id}-message`} name="text" rows={4} maxLength={4000} placeholder={recommendation ? "Describe your idea and how it could help…" : "Include the steps that led to the problem…"} required /></div>
        <AttachmentDropzone files={files} onChange={setFiles} disabled={busy || !!pending.current} />
        <div className={styles.honeypot} aria-hidden="true"><label htmlFor={`${id}-website`}>Leave this empty<input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></label></div>
      </fieldset>
      {!session && <small>Guest replies stay in this browser for up to 90 days. Contact details help our team follow up; they are not used to verify your identity.</small>}
      {error && <p role="alert" className={styles.error}>{error}{pending.current && " Retry sends the same request, without duplicating it."}</p>}
      <button className="rn-button-style--2 rn-btn-solid-green rn-btn-small" type="submit" aria-busy={busy} aria-label={busy ? "Sending request" : undefined} disabled={busy || !active || (!pending.current && !formReady)}>{busy ? <ProgressSpinner style={{ width: "1.25rem", height: "1.25rem" }} strokeWidth="8" animationDuration=".5s" aria-hidden="true" /> : <>{pending.current && error ? <RetryIcon /> : <IconlySend size="1.25rem" />} {pending.current && error ? "Retry request" : recommendation ? "Send recommendation" : "Send report"}</>}</button>
    </form>
    </div>
  </div>;
}
ReportForm.propTypes = { session: PropTypes.object, profile: PropTypes.object, onCreated: PropTypes.func.isRequired, onBack: PropTypes.func.isRequired, active: PropTypes.bool, initialType: PropTypes.oneOf(["problem", "recommendation"]) };
