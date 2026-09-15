import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { useFormikContext } from "formik";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { SITE_URL } from "../../../util/seo/site";
import { relatedEventOptions, visibleRelatedEvents, isRelatedEventSelected, relatedEventLink } from "../../../util/functions/related-events.mjs";
import { FiCheck, FiImage } from "../../ui/icons/IconlyIcons";
import { OptionError, OptionField } from "./EventOptionFields";

const formatDate = value => {
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) ? new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(date) : "Date to be announced";
};


function SelectedEventRow({ link, index, onRemove }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.li layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }} transition={{ duration: reduced ? 0 : 0.22 }} inert={!present || undefined}>
    <div><strong>{link.name || "Untitled link"}</strong><OptionError name={`subEvent.links[${index}].name`} /><OptionError name={`subEvent.links[${index}].href`} /></div>
    <button className="event-option-remove" type="button" disabled={!present} onClick={onRemove} aria-label={`Remove ${link.name || "link"}`}>Remove</button>
  </motion.li>;
}
SelectedEventRow.propTypes = { link: PropTypes.object.isRequired, index: PropTypes.number.isRequired, onRemove: PropTypes.func.isRequired };

function SelectedEvents({ links, onRemove }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div className="event-related-selection-transition" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }} inert={!present || undefined}>
    <div className="event-related-selected">
      <OptionField name="subEvent.description" label="Recommendation heading" placeholder="You might also like" maxLength={1000} />
      <ul aria-label="Advertised events"><AnimatePresence initial={false}>{links.map((link, index) => <SelectedEventRow key={link.href || link.name} link={link} index={index} onRemove={() => onRemove(index)} />)}</AnimatePresence></ul>
    </div>
  </motion.div>;
}
SelectedEvents.propTypes = { links: PropTypes.array.isRequired, onRemove: PropTypes.func.isRequired };

export default function EventRelatedPicker({ currentEventId, active = true }) {
  const id = useId();
  const reduced = useReducedMotion();
  const { values, setFieldValue } = useFormikContext();
  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;
  const [result, setResult] = useState({ events: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const links = values.subEvent?.links ?? [];

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setResult(previous => ({ ...previous, loading: true, error: false }));
    async function load() {
      const responses = await Promise.all([
        requestRef.current("event/events-list", "GET", null, {}, false, false),
        requestRef.current("future-event/full-data-events-list", "GET", null, {}, false, false),
      ]);
      if (cancelled) return;
      setResult({ events: relatedEventOptions(responses.flatMap(response => response?.events ?? []), currentEventId), loading: false, error: responses.some(response => !Array.isArray(response?.events)) });
    }
    load();
    return () => { cancelled = true; };
  }, [active, currentEventId, attempt]);

  const matching = visibleRelatedEvents(result.events, values.region, search);
  const updateLinks = next => setFieldValue("subEvent", { ...values.subEvent, description: values.subEvent?.description?.trim() ? values.subEvent.description : "You might also like", links: next });
  const toggleEvent = event => {
    if (isRelatedEventSelected(event, links)) {
      updateLinks(links.filter(link => !isRelatedEventSelected(event, [link])));
      return;
    }
    if (links.length >= 50) return;
    updateLinks([...links.filter(link => link.name?.trim() || link.href?.trim()), relatedEventLink(event, SITE_URL)]);
  };

  return <section className="event-option-panel event-related-picker" aria-labelledby={`${id}-heading`}>
    <header className="event-option-header"><div className="event-option-title"><h3 id={`${id}-heading`}>Advertise other events</h3></div></header>
    <AnimatePresence initial={false}>{links.length > 0 && <SelectedEvents key="selected-events" links={links} onRemove={index => updateLinks(links.filter((_, i) => i !== index))} />}</AnimatePresence>
    <OptionError name="subEvent" /><OptionError name="subEvent.links" />
    <div className="rn-form-group event-related-search"><label htmlFor={`${id}-search`}>Find an event</label><input id={`${id}-search`} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name or region" /></div>
    {result.loading ? <div className="event-related-skeleton" role="status" aria-label="Loading events" aria-busy="true">{[0, 1, 2].map(index => <div key={index} aria-hidden="true"><span /><span /></div>)}</div> : <>
      {result.error && <p className="event-option-help" role="status">Some events couldn’t be loaded. <button type="button" className="event-option-remove" onClick={() => setAttempt(value => value + 1)}>Try again</button></p>}
      {!matching.length && <p className="event-option-help" role="status">{search ? "No events match your search." : "No other events are available to advertise."}</p>}
      <div className="event-related-results">{matching.map(event => {
        const selected = isRelatedEventSelected(event, links);
        const disabled = !selected && links.length >= 50;
        return <motion.button type="button" className={`event-related-event${selected ? " is-selected" : ""}`} key={event.id}
          aria-label={`Advertise ${event.title}`} aria-pressed={selected} disabled={disabled} onClick={() => toggleEvent(event)}
          whileHover={reduced || disabled ? undefined : { y: -3 }} whileTap={reduced || disabled ? undefined : { scale: 0.98 }} transition={{ duration: 0.18 }}>
          {event.poster ? <img src={event.poster} alt="" loading="lazy" /> : <span className="event-related-placeholder" aria-hidden="true"><FiImage /></span>}
          <span className="event-related-event__details"><strong className="event-related-event__title">{event.title}</strong><span className="event-related-event__date">{event.region.replaceAll("_", " / ")} · {formatDate(event.correctedDate || event.date)}</span></span>
          <AnimatePresence initial={false}>{selected && <motion.span className="event-related-event__selected" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }} transition={{ duration: reduced ? 0 : 0.18 }} aria-hidden="true"><FiCheck /></motion.span>}</AnimatePresence>
        </motion.button>;
      })}</div>
    </>}
  </section>;
}
EventRelatedPicker.propTypes = { currentEventId: PropTypes.string, active: PropTypes.bool };
