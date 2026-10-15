"use client";

import { useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppModal from "@/elements/ui/modals/AppModal";
import { FiMail, FiPlus, FiTrash2 } from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "@/hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "@/redux/notification";
import { SUCCESS_STYLE } from "@/util/defines/common";
import styles from "./generate-tickets.module.scss";

const emptyGuest = (id) => ({ id, name: "", surname: "", email: "" });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fields = [["name", "First name"], ["surname", "Last name"], ["email", "Email address"]];

const validateGuests = (guests) => {
  const errors = {};
  for (const guest of guests) {
    const row = {};
    if (!guest.name.trim()) row.name = "Enter a first name.";
    if (!guest.surname.trim()) row.surname = "Enter a last name.";
    if (!guest.email.trim()) row.email = "Enter an email address.";
    else if (!emailPattern.test(guest.email.trim())) row.email = "Enter a valid email address.";
    if (Object.keys(row).length) errors[guest.id] = row;
  }
  return errors;
};

const GenerateTicketsModal = ({ visible, onHide, event }) => {
  const [guests, setGuests] = useState([emptyGuest(0)]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationError, setGenerationError] = useState("");
  const nextGuestId = useRef(1);
  const submitting = useRef(false);
  const formId = useId();
  const fieldPrefix = useId();
  const reducedMotion = useReducedMotion();
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();

  const close = () => {
    if (submitting.current) return;
    setGuests([emptyGuest(0)]);
    setErrors({});
    setGenerationError("");
    onHide();
  };

  const addGuest = () => {
    const id = nextGuestId.current++;
    setGuests((current) => [...current, emptyGuest(id)]);
    setGenerationError("");
    requestAnimationFrame(() => document.getElementById(`${fieldPrefix}-${id}-name`)?.focus());
  };

  const removeGuest = (id) => {
    const index = guests.findIndex((guest) => guest.id === id);
    const nextFocusGuest = guests[index + 1] || guests[index - 1];
    setGuests((current) => current.filter((guest) => guest.id !== id));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setGenerationError("");
    if (nextFocusGuest) requestAnimationFrame(() => document.getElementById(`${fieldPrefix}-${nextFocusGuest.id}-name`)?.focus());
  };

  const changeGuest = (id, field, value) => {
    setGuests((current) => current.map((guest) => guest.id === id ? { ...guest, [field]: value } : guest));
    setErrors((current) => {
      if (!current[id]?.[field]) return current;
      const row = { ...current[id] };
      delete row[field];
      const next = { ...current };
      if (Object.keys(row).length) next[id] = row;
      else delete next[id];
      return next;
    });
    setGenerationError("");
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (submitting.current) return;

    const nextErrors = validateGuests(guests);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstGuest = guests.find((guest) => nextErrors[guest.id]);
      const firstField = fields.find(([field]) => nextErrors[firstGuest.id][field])?.[0];
      requestAnimationFrame(() => document.getElementById(`${fieldPrefix}-${firstGuest.id}-${firstField}`)?.focus());
      return;
    }

    submitting.current = true;
    setLoading(true);
    setProgress(0);
    setGenerationError("");
    const failedGuests = [];
    const codeSeed = Date.now();

    try {
      for (const [index, guest] of guests.entries()) {
        setProgress(index + 1);
        const formData = new FormData();
        formData.append("type", "free");
        formData.append("quantity", "1");
        formData.append("origin_url", window.location.origin);
        formData.append("eventId", event.id);
        formData.append("code", String(codeSeed - index));
        formData.append("guestEmail", guest.email.trim());
        formData.append("guestName", `${guest.name.trim()} ${guest.surname.trim()}`);
        formData.append("guestPhone", "-");

        try {
          const result = await sendRequest("event/purchase-ticket/guest", "POST", formData, {}, false, false);
          if (!result?.status) failedGuests.push(guest);
        } catch {
          failedGuests.push(guest);
        }
      }

      const generatedCount = guests.length - failedGuests.length;
      if (generatedCount) {
        dispatch(showNotification({
          ...SUCCESS_STYLE,
          summary: `${generatedCount} free guest ticket${generatedCount === 1 ? "" : "s"} generated. Email delivery queued.`,
        }));
      }

      if (failedGuests.length) {
        setGuests(failedGuests);
        setGenerationError(`${generatedCount ? `${generatedCount} of ${guests.length} tickets were generated. ` : ""}${failedGuests.length} ticket${failedGuests.length === 1 ? "" : "s"} could not be confirmed. Check the guest list before retrying to avoid duplicates. Only those guests remain below.`);
      } else {
        setGuests([emptyGuest(0)]);
        setErrors({});
        onHide();
      }
    } finally {
      submitting.current = false;
      setLoading(false);
      setProgress(0);
    }
  };

  return <AppModal open={visible} onClose={close} title="Generate free guest tickets"
    className={styles.modal} closable={!loading} maximizable={false}
    actions={<div className={styles.footer}>
      <div className={styles.footerActions}>
        <button type="button" className="event-form-button event-form-button--ghost" onClick={close} disabled={loading}>Cancel</button>
        <button type="submit" form={formId} className="event-form-button event-form-button--primary" disabled={loading} aria-busy={loading}>
          {loading ? `Generating ${progress} of ${guests.length}…` : `Generate ${guests.length} ticket${guests.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>}>
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={loading}>
      <p className={styles.intro}><FiMail aria-hidden="true" /> Each generated ticket is queued for email delivery to its guest.</p>
      {generationError && <p className={styles.errorBanner} role="alert">{generationError}</p>}
      {loading && <p className={styles.progress} role="status">Generating ticket {progress} of {guests.length}…</p>}
      <div className={styles.guestList}>
        <AnimatePresence initial={false}>
        {guests.map((guest, index) => <motion.div key={guest.id} className={styles.guestSlot}
          initial={reducedMotion ? false : { height: 0, opacity: 0, marginTop: 0 }}
          animate={{ height: "auto", opacity: 1, marginTop: index === 0 ? 0 : 12 }}
          exit={{ height: 0, opacity: 0, marginTop: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}>
          <section className={styles.guest} aria-labelledby={`${fieldPrefix}-${guest.id}-heading`}>
          <div className={styles.guestHeader}>
            <h3 id={`${fieldPrefix}-${guest.id}-heading`}>Guest {index + 1}</h3>
            {guests.length > 1 && <button type="button" className={styles.remove} onClick={() => removeGuest(guest.id)} disabled={loading} aria-label={`Remove guest ${index + 1}`}><FiTrash2 aria-hidden="true" /><span>Remove</span></button>}
          </div>
          <div className={styles.fields}>
            {fields.map(([field, label]) => {
              const error = errors[guest.id]?.[field];
              const id = `${fieldPrefix}-${guest.id}-${field}`;
              return <div className={`${styles.field} ${field === "email" ? styles.emailField : ""}`} key={field} data-invalid={Boolean(error)}>
                <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
                <input id={id} name={`guests[${index}].${field}`} type={field === "email" ? "email" : "text"} value={guest[field]} onChange={(changeEvent) => changeGuest(guest.id, field, changeEvent.target.value)} disabled={loading} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} autoComplete="off" />
                {error && <span id={`${id}-error`} className={styles.fieldError}>{error}</span>}
              </div>;
            })}
          </div>
          </section>
        </motion.div>)}
        </AnimatePresence>
      </div>
      <button type="button" className={styles.addGuest} onClick={addGuest} disabled={loading}><FiPlus aria-hidden="true" /> Add another guest</button>
    </form>
  </AppModal>;
};

GenerateTicketsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  event: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired }).isRequired,
};

export default GenerateTicketsModal;
