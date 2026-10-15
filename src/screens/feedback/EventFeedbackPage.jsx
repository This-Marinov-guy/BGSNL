"use client";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { IconlyShow } from "@/elements/ui/icons/IconlyIcons";
import FeedbackFrame from "./FeedbackFrame";
import styles from "./event-feedback.module.scss";

const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });

const initialAnswers = {
  enjoyment: "",
  organisation: "",
  favoriteMoment: "",
  improvements: "",
  futureEvents: "",
  additionalComments: "",
};

const ratings = [
  { key: "enjoyment", label: "How much did you enjoy the event?" },
  { key: "organisation", label: "How well was the event organised?" },
];
const written = [
  { key: "favoriteMoment", label: "What was your favourite moment?", max: 2000, rows: 3 },
  { key: "improvements", label: "What could we improve?", max: 2000, rows: 3 },
  { key: "futureEvents", label: "Would you attend another event?", max: 1000, rows: 2 },
  { key: "additionalComments", label: "Anything else you’d like to share?", max: 2000, rows: 3, optional: true },
];

const StateMessage = ({ title, children, retry }) => <section className={styles.state} role="status">
  <h1>{title}</h1>
  <p>{children}</p>
  <div className={styles.stateActions}>
    {retry && <button type="button" onClick={retry}>Try again</button>}
    <a href="/contact">Contact us</a>
  </div>
</section>;
StateMessage.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired, retry: PropTypes.func };

export default function EventFeedbackPage({ ticketId, initialState }) {
  const [phase, setPhase] = useState(initialState.phase);
  const initialPhaseRef = useRef(initialState.phase);
  const [eventTitle, setEventTitle] = useState(initialState.eventTitle || "");
  const [eventPoster, setEventPoster] = useState(initialState.eventPoster || "");
  const [posterFailed, setPosterFailed] = useState(false);
  const [opensAt, setOpensAt] = useState(initialState.opensAt || "");
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false);
  const [answers, setAnswers] = useState(initialAnswers);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (phase === "success" && initialPhaseRef.current !== "success") window.scrollTo(0, 0);
  }, [phase]);

  const load = useCallback(async () => {
    setPhase("loading");
    try {
      const response = await browserFetch(`/api/event/feedback/${ticketId}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 404) { window.location.reload(); return; }
      if (response.status === 410) { setPhase("unavailable"); return; }
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "We could not load this feedback form. Please try again.");
      if (data.state === "submitted") { window.location.reload(); return; }
      setEventTitle(data.eventTitle || "your event");
      setEventPoster(data.eventPoster || "");
      setPosterFailed(false);
      setOpensAt(data.opensAt || "");
      setPhase(data.state === "ready" || data.state === "not_ready" ? data.state : "error");
    } catch (error) {
      if (error.name !== "AbortError") setPhase("error");
    }
  }, [ticketId]);

  const change = (key, value) => {
    setAnswers(current => ({ ...current, [key]: value }));
    setFieldErrors(current => { const next = { ...current }; delete next[`answers.${key}`]; return next; });
    setSubmitError("");
  };

  const showPoster = Boolean(eventPoster && !posterFailed);

  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const errors = {};
    for (const question of ratings) {
      if (!answers[question.key]) errors[`answers.${question.key}`] = "Choose a rating from 1 to 5.";
    }
    for (const question of written) {
      if (!question.optional && !answers[question.key].trim()) errors[`answers.${question.key}`] = "Please add an answer before sending.";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSubmitError("Please complete the highlighted questions before sending.");
      const firstKey = Object.keys(errors)[0].split(".")[1];
      event.currentTarget.querySelector(`[name="${firstKey}"]`)?.focus();
      return;
    }
    setBusy(true);
    setSubmitError("");
    setFieldErrors({});
    try {
      const response = await browserFetch(`/api/event/feedback/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { ...answers, enjoyment: Number(answers.enjoyment), organisation: Number(answers.organisation) } }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (response.status === 409) {
        await load();
        return;
      }
      if (response.status === 422 && data.errors) {
        setFieldErrors(data.errors);
        setSubmitError("Please correct the highlighted answers and try again.");
        return;
      }
      if (!response.ok || !data.status) throw new Error(data.message || "We could not save your feedback. Your answers are still here; please try again.");
      setPhase("success");
    } catch (error) {
      const fallback = "We could not save your feedback. Your answers are still here; check your connection and try again.";
      setSubmitError(["TypeError", "SyntaxError", "TimeoutError"].includes(error.name) ? fallback : error.message || fallback);
    } finally { setBusy(false); }
  };

  return <FeedbackFrame>
      {phase === "loading" && <section className={styles.loading} role="status" aria-label="Loading feedback form">
        <div /><div /><div /><div />
        <p>Checking your ticket and loading the form…</p>
      </section>}
      {phase === "error" && <StateMessage title="We couldn’t check your ticket" retry={load}>
        The form is temporarily unavailable. Try again, or contact us if it keeps failing.
      </StateMessage>}
      {phase === "unavailable" && <StateMessage title="Feedback is unavailable for this event">
        This event is no longer collecting feedback.
      </StateMessage>}
      {phase === "not_ready" && <StateMessage title="Feedback opens after the event">
        You can share your thoughts one day after {eventTitle}{opensAt ? `, from ${formatDisplayDateTime(opensAt)} (Amsterdam time)` : ""}.
      </StateMessage>}
      {phase === "success" && <section className={`${styles.state} ${styles.successPanel}`} role="status" aria-live="polite" aria-labelledby="feedback-success-title">
        <div className={styles.successHeading}>
          <img src="/assets/icons/svgs/success.svg" width="72" height="71" alt="" aria-hidden="true" />
          <h1 id="feedback-success-title">Thank you for your feedback</h1>
        </div>
        <p>Your response for {eventTitle} has been saved. It will help us improve future events.</p>
        <div className={styles.stateActions}>
          <a className={styles.primaryAction} href="/events/future-events">Explore upcoming events</a>
        </div>
      </section>}
      {phase === "ready" && <article className={styles.formPanel}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <h1>How was your experience?</h1>
            <p>Tell us what you enjoyed about <strong>{eventTitle}</strong> and what we could do better.</p>
            {showPoster && <button className={styles.mobilePosterPreview} type="button" onClick={() => setPosterPreviewOpen(true)} aria-label={`Preview ${eventTitle} poster`}>
              <img src={eventPoster} alt="" onError={() => setPosterFailed(true)} />
              <span>Preview event poster</span>
              <IconlyShow aria-hidden="true" />
            </button>}
          </div>
          {showPoster && <div className={styles.posterFrame}><img src={eventPoster} alt={`${eventTitle} poster`} onError={() => setPosterFailed(true)} /></div>}
        </div>
        <form onSubmit={submit} noValidate>
          <fieldset className={styles.group}>
            <legend>Your experience</legend>
            {ratings.map(question => <div className={styles.question} key={question.key}>
              <p className={fieldErrors[`answers.${question.key}`] ? styles.errorLabel : styles.label} id={`${question.key}-label`}>
                {question.label}
              </p>
              <div className={styles.scale} role="radiogroup" aria-labelledby={`${question.key}-label`} aria-required="true">
                {[1, 2, 3, 4, 5].map(value => <label key={value} className={answers[question.key] === String(value) ? styles.selected : ""}>
                  <input type="radio" name={question.key} value={value} required={value === 1}
                    checked={answers[question.key] === String(value)} onChange={() => change(question.key, String(value))}
                    aria-invalid={Boolean(fieldErrors[`answers.${question.key}`])} />
                  <span>{value}</span>
                </label>)}
              </div>
              <div className={styles.scaleEnds}><span>Not at all</span><span>Definitely</span></div>
              {fieldErrors[`answers.${question.key}`] && <p className={styles.fieldError} role="alert">{fieldErrors[`answers.${question.key}`]}</p>}
            </div>)}
          </fieldset>
          <fieldset className={styles.group}>
            <legend>Your thoughts</legend>
            {written.map(question => <div className={styles.question} key={question.key}>
              <label htmlFor={question.key} className={fieldErrors[`answers.${question.key}`] ? styles.errorLabel : styles.label}>
                {question.label}{question.optional && <em> (optional)</em>}
              </label>
              <textarea id={question.key} name={question.key} value={answers[question.key]} rows={question.rows}
                maxLength={question.max} required={!question.optional} autoComplete="off"
                aria-invalid={Boolean(fieldErrors[`answers.${question.key}`])}
                onChange={event => change(question.key, event.target.value)} />
              {answers[question.key].length >= question.max * .8 && <p className={styles.counter}>{answers[question.key].length}/{question.max} characters</p>}
              {fieldErrors[`answers.${question.key}`] && <p className={styles.fieldError} role="alert">{fieldErrors[`answers.${question.key}`]}</p>}
            </div>)}
          </fieldset>
          <div className={styles.submitArea}>
            {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
            <button type="submit" disabled={busy} aria-busy={busy}>{busy ? "Sending…" : "Send feedback"}</button>
          </div>
        </form>
        {posterPreviewOpen && showPoster && <ImageGallery images={[{ src: eventPoster, alt: `${eventTitle} poster` }]} src={eventPoster} alt={`${eventTitle} poster`} fileName={`${eventTitle}-poster`} open onClose={() => setPosterPreviewOpen(false)} />}
      </article>}
  </FeedbackFrame>;
}

EventFeedbackPage.propTypes = {
  ticketId: PropTypes.string.isRequired,
  initialState: PropTypes.shape({
    phase: PropTypes.oneOf(["ready", "not_ready", "unavailable", "error", "success"]).isRequired,
    eventTitle: PropTypes.string,
    eventPoster: PropTypes.string,
    opensAt: PropTypes.string,
  }).isRequired,
};
