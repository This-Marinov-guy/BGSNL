"use client";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { IconlyRotate } from "@/elements/ui/icons/IconlyIcons";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import styles from "./event-feedback-report.module.scss";
import { scrollToListStart } from "@/util/functions/pagination-scroll.mjs";

const questions = [
  ["favoriteMoment", "Favourite moment"],
  ["improvements", "What could we improve?"],
  ["futureEvents", "Would they attend another event?"],
  ["additionalComments", "Anything else"],
];

const submittedAt = value => value && !Number.isNaN(new Date(value).getTime())
  ? formatDisplayDateTime(value)
  : "Date unavailable";

export default function EventFeedbackModal({ event, onClose }) {
  const eventId = event.id || event._id;
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);
  const listStartRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    browserFetch(`/api/event/${encodeURIComponent(eventId)}/feedback?page=${page}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "We couldn't load the feedback. Try again.");
        if (!controller.signal.aborted) { setReport(data); setStatus("ready"); }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [eventId, page, revision]);

  const retry = () => { setStatus("loading"); setRevision(value => value + 1); };
  const visibleReport = Number(report?.page) === page ? report : null;
  const responses = visibleReport?.responses || [];

  return <AppModal open onClose={onClose} title={`Feedback — ${event.title || "Event"}`}
    className={styles.modal} maximizable={false}>
    <div className={styles.content} ref={listStartRef}>
      {status === "loading" && !visibleReport && <div className={styles.loading}>
        <p>Loading feedback responses…</p>
        <LoadingSkeleton label="Loading feedback responses" count={3} />
      </div>}
      {status === "error" && <LoadErrorBanner message={visibleReport ? "We couldn't refresh the responses. Showing the last loaded results; try again." : "We couldn't load this event's feedback. Check your connection or access, then try again."} onRetry={retry} />}
      {visibleReport && <>
        <div className={styles.toolbar}>
          <p role="status"><strong>{visibleReport.total}</strong> {visibleReport.total === 1 ? "response" : "responses"}</p>
          <button className={styles.refreshButton} type="button" onClick={retry} disabled={status === "loading"}
            aria-label="Refresh responses" aria-busy={status === "loading"} title="Refresh responses">
            <IconlyRotate aria-hidden="true" size="1.25rem" />
          </button>
        </div>
        {visibleReport.total === 0 ? <div className={styles.empty} role="status">
          <h3>No feedback yet</h3>
          <p>Responses will appear here after ticket holders use their feedback links.</p>
        </div> : <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Ticket holder</th><th scope="col">Experience</th><th scope="col">Organisation</th><th scope="col">Submitted</th><th scope="col">Answers</th></tr></thead>
              <tbody>{responses.map(response => <FeedbackRow key={response.id} response={response}
                expanded={expandedId === response.id} onToggle={() => setExpandedId(current => current === response.id ? null : response.id)} />)}</tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="Feedback pages">
            <button type="button" onClick={() => { scrollToListStart(listStartRef); setExpandedId(null); setStatus("loading"); setPage(value => value - 1); }} disabled={page <= 1}>Previous</button>
            <span>Page {visibleReport.page} of {visibleReport.pages}</span>
            <button type="button" onClick={() => { scrollToListStart(listStartRef); setExpandedId(null); setStatus("loading"); setPage(value => value + 1); }} disabled={page >= visibleReport.pages}>Next</button>
          </nav>
        </>}
      </>}
    </div>
  </AppModal>;
}

function FeedbackRow({ response, expanded, onToggle }) {
  const detailsId = `feedback-answers-${response.id}`;
  return <>
    <tr>
      <th scope="row" className={styles.person}><strong>{response.name}</strong><span>{response.email || `Ticket ${response.ticketId}`}</span></th>
      <td className={styles.number}>{response.answers.enjoyment} / 5</td>
      <td className={styles.number}>{response.answers.organisation} / 5</td>
      <td>{submittedAt(response.submittedAt)}</td>
      <td><button type="button" className={styles.detailsButton} aria-expanded={expanded} aria-controls={detailsId} onClick={onToggle}>{expanded ? "Hide answers" : "View answers"}</button></td>
    </tr>
    {expanded && <tr id={detailsId} className={styles.detailsRow}><td colSpan={5}>
      <dl>{questions.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{response.answers[key] || "—"}</dd></div>)}</dl>
    </td></tr>}
  </>;
}

FeedbackRow.propTypes = { response: PropTypes.object.isRequired, expanded: PropTypes.bool.isRequired, onToggle: PropTypes.func.isRequired };
EventFeedbackModal.propTypes = { event: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired };
