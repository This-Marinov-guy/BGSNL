import { useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";

export default function DraftSaveButton({ note = "", defaultEmail = "", disabled = false, onBeforeOpen, onSave, onEmailReminder, onComplete }) {
  const id = useId();
  const emailRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note);
  const [email, setEmail] = useState(defaultEmail);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [savedDraft, setSavedDraft] = useState(null);
  const savingRef = useRef(false);
  const saving = stage !== null;
  const receiver = email.trim().toLowerCase();
  const canReuseDraft = savedDraft?.note === text.trim();

  const save = async () => {
    if (savingRef.current || disabled) return;
    if (receiver && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiver)) {
      setEmailError("Enter a valid email address, or leave it blank.");
      emailRef.current?.focus();
      return;
    }
    savingRef.current = true;
    setEmailError("");
    setError("");
    let draft = canReuseDraft ? savedDraft : null;
    try {
      if (!draft) {
        setStage("saving");
        const result = await onSave(text.trim());
        if (!result?.id) {
          setError("The draft could not be saved. Your note is still here; please try again.");
          return;
        }
        draft = { id: result.id, note: text.trim() };
        setSavedDraft(draft);
      }
      if (receiver) {
        setStage("emailing");
        const result = await onEmailReminder(draft.id, receiver);
        if (!result?.status) {
          setError("Your draft is saved, but the email could not be queued. Try again, or clear the email to finish without sending it.");
          return;
        }
      }
      setOpen(false);
      onComplete(receiver);
    } catch {
      setError(draft ? "Your draft is saved, but the email could not be queued. Please try again." : "The draft could not be saved. Your note is still here; please try again.");
    } finally {
      savingRef.current = false;
      setStage(null);
    }
  };

  return (
    <>
      <button type="button" disabled={disabled} className="event-form-button event-form-button--draft" onClick={() => { if (onBeforeOpen?.() === false) return; setText(note); setEmail(defaultEmail); setError(""); setEmailError(""); setSavedDraft(null); setOpen(true); }}>Save as draft</button>
      <Dialog
        visible={open}
        header="Save event draft"
        className="event-draft-note-dialog"
        onHide={() => { if (!saving) setOpen(false); }}
        closable={!saving}
        dismissableMask={false}
        blockScroll
        footer={<div className="event-draft-note-dialog__actions">
          <button type="button" className="event-form-button event-form-button--ghost" disabled={saving} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="event-form-button event-form-button--primary" disabled={saving || disabled} onClick={save}>
            {saving ? <><span className="event-form-button__spinner" aria-hidden="true" /><span role="status">{stage === "emailing" ? "Sending email…" : "Saving…"}</span></> : receiver ? canReuseDraft ? "Retry email" : "Save & email link" : canReuseDraft ? "Done" : "Save draft"}
          </button>
        </div>}
      >
        <p>Leave a note for anyone continuing this draft. It will appear on the draft cards.</p>
        <div className="rn-form-group">
          <label htmlFor={id}>Note (optional)</label>
          <textarea id={id} name="draftNote" rows={4} maxLength={1000} value={text} disabled={saving} placeholder="e.g., Waiting for the venue to confirm the time." onChange={event => setText(event.target.value)} aria-describedby={`${id}-count`} />
        </div>
        <p id={`${id}-count`} className="event-draft-note-dialog__count">{text.length}/1000</p>
        <div className={`rn-form-group${emailError ? " has-validation-error" : ""}`}>
          <label htmlFor={`${id}-email`}>Send continue link to (optional)</label>
          <input ref={emailRef} id={`${id}-email`} name="draftReminderEmail" type="email" autoComplete="email" maxLength={254} value={email} disabled={saving} placeholder="you@example.com" onChange={event => { setEmail(event.target.value); setEmailError(""); }} aria-invalid={Boolean(emailError)} aria-describedby={`${id}-email-help`} />
        </div>
        <p id={`${id}-email-help`} className={emailError ? "event-unsaved-dialog__error" : "event-draft-note-dialog__hint"} role={emailError ? "alert" : undefined}>{emailError || "We’ll email a link to continue this draft. Leave blank to save without an email."}</p>
        {error && <p className="event-unsaved-dialog__error" role="alert">{error}</p>}
      </Dialog>
    </>
  );
}
DraftSaveButton.propTypes = { note: PropTypes.string, defaultEmail: PropTypes.string, disabled: PropTypes.bool, onBeforeOpen: PropTypes.func, onSave: PropTypes.func.isRequired, onEmailReminder: PropTypes.func.isRequired, onComplete: PropTypes.func.isRequired };
