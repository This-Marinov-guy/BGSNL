"use client";
import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { IconlyArrowLeft, IconlySend } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { createGuestAccess, forgetGuestReport, rememberGuestReport } from "./support-state.mjs";
import styles from "./support.module.scss";

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

export default function ReportForm({ token, profile, onCreated, onBack, active }) {
  const id = useId();
  const [contactMethod, setContactMethod] = useState("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(null);
  const formRef = useRef(null);
  const heading = useRef(null);

  useEffect(() => { if (active) heading.current?.focus({ preventScroll: true }); }, [active]);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const data = { subject: String(form.get("subject") || ""), text: String(form.get("text") || ""),
      contact: token ? undefined : { name: String(form.get("name") || ""), [contactMethod]: String(form.get("contact") || "") },
      website: String(form.get("website") || ""), pagePath: window.location.pathname, environment: clientEnvironment() };
    // A failed/ambiguous submission must keep its identity and payload. Do not
    // turn Retry into a second conversation.
    if (!pending.current) {
      const access = token ? { id: crypto.randomUUID() } : createGuestAccess();
      pending.current = { access, data: { ...data, id: access.id } };
    }
    setBusy(true); setError("");
    try {
      const { access, data: payload } = pending.current;
      if (!token) rememberGuestReport(access);
      const result = await supportRequest("conversations", { token, secret: access.secret, data: payload });
      pending.current = null;
      formRef.current?.reset();
      onCreated(result.conversation);
    } catch (failure) {
      // Validation is a definite rejection, so fields can be corrected. Keep
      // the operation ID for network failures and server-unavailable responses.
      if ([401, 403, 422, 429].includes(failure.status)) {
        if (!token) forgetGuestReport(pending.current.access.id);
        pending.current = null;
      }
      setError(failure.message);
    } finally { setBusy(false); }
  }

  return <div className={styles.formView}>
    <button className={styles.textButton} type="button" onClick={onBack}><IconlyArrowLeft size="1.25rem" /> Your reports</button>
    <h3 className="type-subheading" tabIndex={-1} ref={heading}>Report a problem</h3>
    <p>Tell us what happened. Don’t include passwords, payment details or sensitive documents.</p>
    <form className={styles.form} onSubmit={submit} ref={formRef}>
      <fieldset disabled={busy || (!!error && !!pending.current)}>
        {token ? <p className={styles.identity}>Reporting as <strong>{profile?.contact?.name || "your signed-in account"}</strong>{profile?.contact?.email && <small>{profile.contact.email}</small>}</p> : <>
          <div className="rn-form-group"><label htmlFor={`${id}-name`}>Your name</label><input className="bgsnl-form-control" id={`${id}-name`} name="name" autoComplete="name" maxLength={160} required /></div>
          <div className={styles.methodSwitch} aria-label="Contact method">
            {[["email", "Email"], ["phone", "Phone"]].map(([value, label]) => <button key={value} type="button" aria-pressed={contactMethod === value} onClick={() => setContactMethod(value)}>{label}</button>)}
          </div>
          <div className="rn-form-group"><label htmlFor={`${id}-contact`}>{contactMethod === "email" ? "Email address" : "Phone number"}</label><input key={contactMethod} className="bgsnl-form-control" id={`${id}-contact`} name="contact" type={contactMethod === "email" ? "email" : "tel"} autoComplete={contactMethod === "email" ? "email" : "tel"} maxLength={contactMethod === "email" ? 254 : 40} placeholder={contactMethod === "phone" ? "+31 …" : "you@example.com"} required /></div>
        </>}
        <div className="rn-form-group"><label htmlFor={`${id}-subject`}>What isn’t working?</label><input className="bgsnl-form-control" id={`${id}-subject`} name="subject" maxLength={140} placeholder="A short description of the problem" required /></div>
        <div className="rn-form-group"><label htmlFor={`${id}-message`}>What happened?</label><textarea className="bgsnl-form-control" id={`${id}-message`} name="text" rows={4} maxLength={4000} placeholder="Include the steps that led to the problem…" required /></div>
        <div className={styles.honeypot} aria-hidden="true"><label htmlFor={`${id}-website`}>Leave this empty<input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></label></div>
      </fieldset>
      {!token && <small>Guest replies stay in this browser for up to 90 days. Contact details help our team follow up; they are not used to verify your identity.</small>}
      <small>Replies appear here. We don’t provide live chat. <a href="/terms-and-legals" target="_blank" rel="noreferrer">Privacy information</a></small>
      {error && <p role="alert" className={styles.error}>{error}{pending.current && " Retry sends the same report, without duplicating it."}</p>}
      <button className="rn-button-style--2 rn-btn-green rn-btn-small" type="submit" disabled={busy || !active}><IconlySend size="1.25rem" /> {busy ? "Sending…" : pending.current && error ? "Retry report" : "Send report"}</button>
    </form>
  </div>;
}
ReportForm.propTypes = { token: PropTypes.string, profile: PropTypes.object, onCreated: PropTypes.func.isRequired, onBack: PropTypes.func.isRequired, active: PropTypes.bool };
