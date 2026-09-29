"use client";

import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import FilterPanel from "@/elements/ui/filters/FilterPanel";
import Pagination from "@/elements/common/Pagination";

import { SelectInput } from "@/compat/primereact";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { selectUser } from "@/redux/user";
import { IconlyArrowRight, IconlyBug, IconlyDocument, IconlyImprove, IconlyMessage } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { guestReports, mergeSupportTickets, STATUS_LABELS, SUPPORT_TYPE_LABELS, supportScope } from "./support-state.mjs";
import Conversation from "./Conversation";
import ReportForm from "./ReportForm";
import styles from "./support.module.scss";
import SupportLoading from "./SupportLoading";
import { watchSupportLive } from "./support-live.mjs";
import { useSupportUnread } from "./use-support-unread";
import { supportTicketUnread } from "./support-unread.mjs";
import { isTemporarySupportError } from "./support-errors.mjs";

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -7,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};

const REDUCED_VIEW_TRANSITION = {
  initial: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

function DeskSession({ session, staff, active, welcomeImage, listDecoration, selectedTicketId, onSelectTicket }) {
  const { seen, ready: seenReady } = useSupportUnread(session, staff);
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState(selectedTicketId ? "thread" : "list");
  const [newType, setNewType] = useState("problem");
  const startNew = (type) => { setNewType(type); setView("new"); };
  const [selected, setSelected] = useState(selectedTicketId || null);
  useEffect(() => {
    if (selectedTicketId !== undefined) { setSelected(selectedTicketId); setView(selectedTicketId ? "thread" : "list"); }
  }, [selectedTicketId]);
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(staff ? 10 : 25);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [reload, setReload] = useState(0);
  const refresh = () => setReload((value) => value + 1);

  useEffect(() => {
    if (!active || !session) return undefined;
    const controller = new AbortController();
    supportRequest("profile", { session, signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setProfile(result);
    }).catch((failure) => { if (!controller.signal.aborted && !isTemporarySupportError(failure)) setError(failure.message); });
    return () => controller.abort();
  }, [active, session]);

  useEffect(() => {
    if (!active || view !== "list") return undefined;
    const controller = new AbortController();
    let fetching = false;
    async function fetchList() {
      if (fetching || document.hidden) return;
      fetching = true;
      let temporaryFailure = false;
      try {
        if (session || staff) {
          const response = await supportRequest(`${staff ? "inbox" : "conversations"}?page=${page}&pageSize=${pageSize}&status=${status}`, { session, signal: controller.signal });
          if (!controller.signal.aborted) {
            setTotal(response.total || 0);
            if (response.totalPages && page > response.totalPages) { setPage(response.totalPages); return; }
            setItems(current => mergeSupportTickets(current, response.conversations)); setHasMore(response.hasMore);
          }
        } else {
          const saved = guestReports();
          const results = await Promise.all(saved.map(async ({ id, secret }) => {
            try { return (await supportRequest(`conversations/${id}`, { secret, signal: controller.signal })).conversation; }
            catch (failure) {
              if ([401, 404].includes(failure.status)) return null;
              throw failure;
            }
          }));
          if (!controller.signal.aborted) {
            setItems(current => mergeSupportTickets(current, results.filter(Boolean).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))));
            setNotice(results.some((item) => !item) ? "Some guest reports are not confirmed or their access has expired. Retry an unfinished submission, or contact the team if you need help recovering access." : "");
            setHasMore(false);
          }
        }
        if (!controller.signal.aborted) setError("");
      } catch (failure) {
        temporaryFailure = isTemporarySupportError(failure);
        if (!controller.signal.aborted && !temporaryFailure) { if ([401, 403].includes(failure.status)) setItems([]); setError(failure.message); }
        throw failure;
      } finally { fetching = false; if (!controller.signal.aborted && !temporaryFailure) setLoading(false); }
    }
    setLoading(true);
    const stop = watchSupportLive({ refresh: fetchList, subscription: () => {
      if (session || staff) return { staff };
      const guests = guestReports().map(({ id, secret }) => ({ id, secret }));
      return guests.length ? { guests } : null;
    } });
    return () => { controller.abort(); stop(); };
  }, [active, session, staff, view, page, pageSize, status, reload]);

  function back() { setView("list"); setSelected(null); onSelectTicket?.(null); refresh(); }
  function open(record) { setSelected(record.id); setView("thread"); onSelectTicket?.(record.id); }

  const viewTransition = reduceMotion ? REDUCED_VIEW_TRANSITION : VIEW_TRANSITION;

  return <div className={styles.desk} data-support-desk data-html2canvas-ignore="true" data-private data-hj-suppress data-clarity-mask data-dd-privacy="mask">
    <AnimatePresence initial={false} mode="wait">
      {view === "new" && <motion.div key="new" className={styles.view} variants={viewTransition} initial="initial" animate="visible" exit="exit">
        {!staff && <ReportForm initialType={newType} session={session} profile={profile} onCreated={open} onBack={back} active={active} />}
      </motion.div>}
      {view === "thread" && <motion.div key={`thread-${selected}`} className={styles.view} variants={viewTransition} initial="initial" animate="visible" exit="exit">
        <Conversation id={selected} session={session} secret={session ? undefined : guestReports().find(({ id }) => id === selected)?.secret} staff={staff} active={active} onBack={back} />
      </motion.div>}
      {view === "list" && <motion.div key="list" className={styles.listView} variants={viewTransition} initial="initial" animate="visible" exit="exit">
      {!staff && <div className={`${styles.ticketRequestsIntro} ${welcomeImage ? styles.withWelcomeImage : ""}`}>
        <div className={styles.ticketRequestsControls}>
          <h2 style={{marginBottom: '1rem'}} className={`page-breadcrumb__title archive ${styles.ticketRequestsTitle}`}>Ticket Requests</h2>
          <div className={styles.newActions}>
            <button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => startNew("problem")} type="button"><IconlyDocument size="1.25rem" aria-hidden="true" /> Report a problem</button>
            <button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => startNew("recommendation")} type="button"><IconlyImprove size="1.25rem" aria-hidden="true" /> Recommend improvement</button>
          </div>
        </div>
        {welcomeImage}
      </div>}
      {staff && <FilterPanel onClear={() => { setStatus("all"); setPage(1); }}><label>Status<SelectInput className="bgsnl-form-control" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All reports</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectInput></label></FilterPanel>}
      {error && <LoadErrorBanner message={error} onRetry={refresh} />}
      {loading && !items.length ? <SupportLoading /> : !items.length && !error ? staff ? <div className={styles.empty}>
        <h3 className={`type-subheading ${styles.emptyHeading}`}><IconlyMessage size="2.5rem" /><span>No reports here</span></h3><p>New reports and recommendations will appear here. Try a different status filter.</p>
      </div> : <div className={styles.ticketEmpty}>
        <h3 className="type-subheading">No tickets yet</h3>
        <p>Your reports and recommendations will appear here.</p>
      </div> : <ul className={styles.reportList} aria-label="Support tickets">{items.map((record) => <li key={record.id}><button className={styles.reportItem} type="button" onClick={() => open(record)}>
        {seenReady && supportTicketUnread(record, seen, staff) && <span className={styles.unreadDot} role="img" aria-label="Unread ticket update" title="Unread ticket update" />}
        <div className={styles.row}><span className={`${styles.status} ${styles.ticketStatusBadge}`} data-status={record.status}>{STATUS_LABELS[record.status]}</span><small className={styles.ticketReference}><span className={styles.ticketTypeIcon} data-type={record.type || "problem"} title={SUPPORT_TYPE_LABELS[record.type || "problem"]}>{record.type === "recommendation" ? <IconlyImprove size="1.25rem" title="Recommendation" /> : <IconlyBug size="1.25rem" title="Problem report" />}</span>#{record.reference}</small></div>
        <strong>{record.subject}</strong>{staff && <span>{record.contact?.name} <small>· {record.contact?.source === "guest" ? "Guest" : "Account"}</small></span>}
        <div className={styles.row}><small><time dateTime={record.lastMessageAt}>{new Date(record.lastMessageAt).toLocaleDateString("en-GB", { day: "2-digit", month: "numeric", year: "numeric" })}</time></small><IconlyArrowRight size="1.25rem" /></div>
      </button></li>)}</ul>}
      {staff ? <>
        <small aria-live="polite">{loading ? <LoadingSkeleton label="Loading tickets" variant="inline" /> : total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} tickets` : "0 tickets"}</small>
        <Pagination first={(page - 1) * pageSize} rows={pageSize} totalRecords={total} rowsPerPageOptions={[10, 25, 50]} ariaLabel="Support ticket pages" onPageChange={event => {
          setLoading(true); setItems([]); setPage(event.page + 1); setPageSize(event.rows);
        }} />
      </> : (page > 1 || hasMore) && <nav className={styles.row} aria-label="Report pages"><button className={styles.textButton} type="button" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page}</span><button className={styles.textButton} type="button" disabled={!hasMore || loading} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      </motion.div>}
    </AnimatePresence>
    {view === "list" && listDecoration}
  </div>;
}
DeskSession.propTypes = { session: PropTypes.object, staff: PropTypes.bool, active: PropTypes.bool, welcomeImage: PropTypes.node, listDecoration: PropTypes.node, selectedTicketId: PropTypes.string, onSelectTicket: PropTypes.func };

export default function SupportDesk({ staff = false, active = true, welcomeImage, listDecoration, selectedTicketId, onSelectTicket }) {
  const { session } = useSelector(selectUser);
  return <DeskSession key={`${supportScope(session)}:${staff}`} session={session} staff={staff} active={active} welcomeImage={welcomeImage} listDecoration={listDecoration} selectedTicketId={selectedTicketId} onSelectTicket={onSelectTicket} />;
}
SupportDesk.propTypes = { staff: PropTypes.bool, active: PropTypes.bool, welcomeImage: PropTypes.node, listDecoration: PropTypes.node, selectedTicketId: PropTypes.string, onSelectTicket: PropTypes.func };
