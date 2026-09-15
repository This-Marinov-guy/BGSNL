import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { Link } from "@/util/navigation";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { FiChevronLeft, FiChevronRight } from "../../ui/icons/IconlyIcons";

const dateFormat = new globalThis.Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" });
const timeFormat = new globalThis.Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });

function RegionEventDrafts({ region, currentDraftId, disabled = false }) {
  const id = useId();
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;
  const trackRef = useRef(null);
  const [result, setResult] = useState({ loading: true, error: false, drafts: [] });
  const [attempt, setAttempt] = useState(0);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const regionName = capitalizeFirstLetter(region, true);

  useEffect(() => {
    let active = true;
    setResult({ loading: true, error: false, drafts: [] });
    const loadDrafts = async () => {
      const response = await requestRef.current(`future-event/full-data-events-list?region=${encodeURIComponent(region)}`, "GET", null, {}, false, false);
      if (!active) return;
      if (!Array.isArray(response?.events)) {
        setResult({ loading: false, error: true, drafts: [] });
        return;
      }
      const drafts = response.events.filter(event => event.status === "draft" && event.region === region && event.id !== currentDraftId);
      drafts.sort((a, b) => (Date.parse(b.metadata?.updatedAt || b.createdAt) || 0) - (Date.parse(a.metadata?.updatedAt || a.createdAt) || 0));
      setResult({ loading: false, error: false, drafts });
    };
    loadDrafts();
    return () => { active = false; };
  }, [region, currentDraftId, attempt]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const updateEdges = () => {
      const bounds = track.getBoundingClientRect();
      setEdges({
        previous: (track.firstElementChild?.getBoundingClientRect().left ?? bounds.left) < bounds.left - 2,
        next: (track.lastElementChild?.getBoundingClientRect().right ?? bounds.right) > bounds.right + 2,
      });
    };
    updateEdges();
    track.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => { track.removeEventListener("scroll", updateEdges); observer.disconnect(); };
  }, [result]);

  const scroll = direction => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const loadingSkeleton = (
    <section className="event-region-drafts event-region-drafts--loading" role="status" aria-label={`Loading drafts for ${regionName}`} aria-busy="true">
      <span className="visually-hidden">Loading drafts for {regionName}…</span>
      <div aria-hidden="true">
        <div className="event-region-drafts__header"><h3>Continue from a draft</h3><div className="event-region-drafts__skeleton-navigation"><span /><span /></div></div>
        <div className="event-region-drafts__skeleton-cards">
          {[0, 1, 2].map(index => <div className="event-region-drafts__card" key={index}>
            <div className="event-region-drafts__content">
              <div className="event-region-drafts__card-header">
                <div className="event-region-drafts__facts">
                  <div className="event-region-drafts__skeleton-title" />
                  <div className="event-region-drafts__skeleton-date" />
                </div>
                <div className="event-region-drafts__skeleton-poster" />
              </div>
              <div className="event-region-drafts__skeleton-button" />
            </div>
          </div>)}
        </div>
      </div>
    </section>
  );
  if (result.loading) return loadingSkeleton;
  if (result.error) return <div className="event-region-drafts__message" role="status">We couldn’t load drafts for {regionName}. <button type="button" disabled={disabled} onClick={() => setAttempt(value => value + 1)}>Try again</button></div>;
  if (!result.drafts.length) return <p className="event-region-drafts__message" role="status">No drafts in {regionName}. Continue creating your event below.</p>;

  return (
    <section className="event-region-drafts event-region-drafts--loaded" aria-labelledby={`${id}-heading`} aria-roledescription="carousel">
      <header className="event-region-drafts__header">
        <h3 id={`${id}-heading`}>Continue from a draft</h3>
        <div className="event-region-drafts__navigation">
          <button type="button" aria-label="Previous drafts" aria-controls={`${id}-track`} disabled={disabled || !edges.previous} onClick={() => scroll(-1)}><FiChevronLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Next drafts" aria-controls={`${id}-track`} disabled={disabled || !edges.next} onClick={() => scroll(1)}><FiChevronRight aria-hidden="true" /></button>
        </div>
      </header>
      <div className="event-region-drafts__track" id={`${id}-track`} ref={trackRef}>
        {result.drafts.map((draft, index) => {
          const title = draft.title?.trim() || draft.draftData?.title?.trim() || "Untitled draft";
          const rawDate = draft.date || draft.draftData?.date;
          const date = rawDate ? new Date(rawDate) : null;
          const hasDate = date && Number.isFinite(date.valueOf());
          const poster = draft.poster || draft.draftData?.poster;
          const note = typeof draft.draftData?.note === "string" ? draft.draftData.note.trim() : "";
          return (
            <article className="event-region-drafts__card" key={draft.id} aria-roledescription="slide" aria-label={`${index + 1} of ${result.drafts.length}`}>
              <div className="event-region-drafts__content">
                <div className="event-region-drafts__card-header">
                  <div className="event-region-drafts__facts">
                    <h4>{title}</h4>
                    {hasDate ? <time dateTime={date.toISOString()}>{dateFormat.format(date)} · {timeFormat.format(date)}</time> : <p>Date and time not set</p>}
                  </div>
                  {typeof poster === "string" && poster && <img className="event-region-drafts__poster" src={poster} alt={`${title} poster`} loading="lazy" />}
                </div>
                {note && <p className="event-draft-note"><strong>Note</strong>{note}</p>}
                <Link to={`/user/dashboard/events/${encodeURIComponent(draft.id)}/edit`} className="event-region-drafts__continue" aria-label={`Continue ${title}`} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} onClick={event => { if (disabled) event.preventDefault(); }}><span>Continue</span><span className="event-region-drafts__continue-icon" aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
RegionEventDrafts.propTypes = { region: PropTypes.string.isRequired, currentDraftId: PropTypes.string, disabled: PropTypes.bool };


function DraftHeaderPanel({ region, currentDraftId, disabled }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="event-region-drafts-transition"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden={!present || undefined}
      inert={!present || undefined}
    >
      <RegionEventDrafts region={region} currentDraftId={currentDraftId} disabled={disabled || !present} />
    </motion.div>
  );
}
DraftHeaderPanel.propTypes = RegionEventDrafts.propTypes;

export default function RegionEventDraftsPanel({ region, scope, visible = true, currentDraftId, disabled = false }) {
  return (
    <AnimatePresence mode="wait">
      {visible && region && <DraftHeaderPanel key={`${scope || ""}:${region}`} region={region} currentDraftId={currentDraftId} disabled={disabled} />}
    </AnimatePresence>
  );
}
RegionEventDraftsPanel.propTypes = { ...RegionEventDrafts.propTypes, scope: PropTypes.string, visible: PropTypes.bool };
