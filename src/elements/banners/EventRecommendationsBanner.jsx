"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiX, IconlyImage } from "@/elements/ui/icons/IconlyIcons";
import { DISMISSAL_KEY, dismissRecommendations, isRecommendationDismissed, restoreRecommendations } from "@/util/functions/event-recommendation-dismissal.mjs";
import { useHttpClient } from "@/hooks/common/http-hook";
import { eventLinkIdentifier, eventLinkRegion, relatedEventPoster } from "@/util/functions/related-events.mjs";
import styles from "./event-recommendations.module.scss";

const recommendationEventCache = new Map();
const recommendationPosterCache = new Map();

function preloadPoster(src) {
  if (!src) return Promise.resolve(null);
  if (!recommendationPosterCache.has(src)) {
    recommendationPosterCache.set(src, new Promise(resolve => {
      const image = new window.Image();
      image.onload = () => resolve(src);
      image.onerror = () => resolve(null);
      image.src = src;
    }));
  }
  return recommendationPosterCache.get(src);
}

async function prepareRecommendation(link, sendRequest) {
  let loadedEvent = null;
  if (!link.poster || (!link.correctedDate && !link.date)) {
    const identifier = eventLinkIdentifier(link.href);
    const region = eventLinkRegion(link.href);
    if (identifier) {
      if (!recommendationEventCache.has(link.href)) {
        recommendationEventCache.set(link.href, sendRequest(
          `event/event-details/${encodeURIComponent(identifier)}${region ? `?region=${encodeURIComponent(region)}` : ""}`,
          "GET",
          null,
          {},
          false,
          false,
        ).then(response => response?.event ?? null).catch(() => null));
      }
      loadedEvent = await recommendationEventCache.get(link.href);
    }
  }

  const poster = link.poster || relatedEventPoster(loadedEvent);
  const readyPoster = await preloadPoster(poster);
  return {
    ...link,
    poster: readyPoster,
    correctedDate: link.correctedDate || link.date || loadedEvent?.correctedDate || loadedEvent?.date,
  };
}

function RecommendationCard({ link }) {
  const [failed, setFailed] = useState(false);
  const poster = link.poster;
  const dateValue = link.correctedDate || link.date;
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const formattedDate = parsedDate && Number.isFinite(parsedDate.getTime())
    ? new globalThis.Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Amsterdam",
    }).format(parsedDate)
    : "";

  return <a className={styles.card} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.name} (opens in a new tab)`}>
    <span className={styles.poster}>
      {poster && !failed ? <img src={poster} alt="" loading="lazy" onError={() => setFailed(true)} /> : <IconlyImage size={30} />}
    </span>
    <span className={styles.eventDetails}>
      <span className={styles.eventTitle}>{link.name}</span>
      {formattedDate && <time className={styles.eventDate} dateTime={parsedDate.toISOString()}>{formattedDate}</time>}
    </span>
  </a>;
}
RecommendationCard.propTypes = { link: PropTypes.object.isRequired };

export default function EventRecommendationsBanner({ eventId, heading, links }) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [bottom, setBottom] = useState(12);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [preparedItems, setPreparedItems] = useState([]);
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const items = useMemo(
    () => (links || []).filter(link => link.name?.trim() && /^(https?:\/\/|\/(?!\/))/i.test(link.href || "")),
    [links],
  );
  const activeItem = preparedItems[activeIndex] ?? preparedItems[0];

  useEffect(() => {
    let active = true;
    Promise.all(items.map(link => prepareRecommendation(link, request.current)))
      .then(nextItems => { if (active) setPreparedItems(nextItems); });
    return () => { active = false; };
  }, [items]);

  useEffect(() => {
    if (!eventId) return;
    const check = () => {
      try { setVisible(!isRecommendationDismissed(window.localStorage, eventId)); }
      catch { setVisible(true); }
    };
    check();
    setReady(true);
    const sync = event => { if (event.key === DISMISSAL_KEY || event.key === null) check(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [eventId]);

  useEffect(() => {
    if (!visible || !preparedItems.length) return;
    let footer;
    const measure = () => setBottom(Math.max(0, footer?.getBoundingClientRect().height || 0) + 12);
    const resize = new ResizeObserver(measure);
    const sync = () => {
      const next = document.querySelector(".sticky-button-footer");
      if (next !== footer) {
        if (footer) resize.unobserve(footer);
        footer = next;
        if (footer) resize.observe(footer);
        measure();
      }
    };
    const mutations = new MutationObserver(sync);
    mutations.observe(document.body, { childList: true, subtree: true });
    sync();
    return () => { mutations.disconnect(); resize.disconnect(); };
  }, [visible, preparedItems.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [eventId, preparedItems.length]);

  useEffect(() => {
    if (!visible || paused || preparedItems.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % preparedItems.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [paused, preparedItems.length, visible]);

  const dismiss = () => {
    setVisible(false);
    try { dismissRecommendations(window.localStorage, eventId); } catch { /* Storage may be blocked. */ }
  };
  const reopen = () => {
    try { restoreRecommendations(window.localStorage, eventId); } catch { /* Storage may be blocked. */ }
    setVisible(true);
  };
  return <>
    {ready && !visible && preparedItems.length > 0 && <button type="button" className={styles.reopen} onClick={reopen}>Show recommended events</button>}
    {ready && createPortal(<AnimatePresence>{visible && preparedItems.length > 0 && <motion.aside key={eventId} className={styles.banner} style={{ bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    aria-labelledby={titleId} initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : 24 }} transition={{ duration: reducedMotion ? 0 : .22 }}>
    <header className={styles.header}>
      <h2 id={titleId}>{heading?.trim() || "You might also like"}</h2>
      <div className={styles.actions}>
        <button type="button" className={styles.close} aria-label="Hide recommendations for this event for two weeks" onClick={dismiss}><FiX size={20} /></button>
      </div>
    </header>
    <div className={styles.carousel} role="region" aria-label="Recommended events carousel" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {activeItem && <motion.div className={styles.slide} key={activeItem.href}
          initial={{ opacity: 0, x: reducedMotion ? 0 : 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reducedMotion ? 0 : -18 }}
          transition={{ duration: reducedMotion ? 0 : .22 }}>
          <RecommendationCard link={activeItem} />
        </motion.div>}
      </AnimatePresence>
    </div>
  </motion.aside>}</AnimatePresence>, document.body)}
  </>;
}
EventRecommendationsBanner.propTypes = {
  eventId: PropTypes.string.isRequired,
  heading: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    href: PropTypes.string,
    poster: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    correctedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
};
