"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { selectUser } from "@/redux/user";
import { IconlyArrowRight, IconlyMessage, IconlyPlus } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { forgetGuestReports, guestReports, STATUS_LABELS, supportScope } from "./support-state.mjs";
import Conversation from "./Conversation";
import ReportForm from "./ReportForm";
import styles from "./support.module.scss";

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

function DeskSession({ session, staff, active }) {
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [reload, setReload] = useState(0);
  const [confirmForget, setConfirmForget] = useState(false);
  const refresh = () => setReload((value) => value + 1);

  useEffect(() => {
    if (!active || !session) return undefined;
    const controller = new AbortController();
    supportRequest("profile", { session, signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setProfile(result);
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [active, session]);

  useEffect(() => {
    if (!active || view !== "list") return undefined;
    const controller = new AbortController();
    let fetching = false;
    async function fetchList() {
      if (fetching || document.hidden) return;
      fetching = true;
      try {
        if (session || staff) {
          const response = await supportRequest(`${staff ? "inbox" : "conversations"}?page=${page}&status=${status}`, { session, signal: controller.signal });
          if (!controller.signal.aborted) { setItems(response.conversations); setHasMore(response.hasMore); }
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
            setItems(results.filter(Boolean).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
            setNotice(results.some((item) => !item) ? "Some guest reports are not confirmed or their access has expired. Retry an unfinished submission, or contact the team if you need help recovering access." : "");
            setHasMore(false);
          }
        }
        if (!controller.signal.aborted) setError("");
      } catch (failure) {
        if (!controller.signal.aborted) { if ([401, 403].includes(failure.status)) setItems([]); setError(failure.message); }
      } finally { fetching = false; if (!controller.signal.aborted) setLoading(false); }
    }
    setLoading(true); fetchList();
    const timer = setInterval(fetchList, 20000);
    document.addEventListener("visibilitychange", fetchList);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener("visibilitychange", fetchList); };
  }, [active, session, staff, view, page, status, reload]);

  function back() { setView("list"); setSelected(null); refresh(); }
  function open(record) { setSelected(record.id); setView("thread"); }
  function forget() {
    try { forgetGuestReports(); setItems([]); setNotice(""); setConfirmForget(false); refresh(); }
    catch { setError("Browser storage could not be cleared. Check your browser privacy settings."); }
  }

  const viewTransition = reduceMotion ? REDUCED_VIEW_TRANSITION : VIEW_TRANSITION;

  return <div className={styles.desk} data-support-desk data-html2canvas-ignore="true" data-private data-hj-suppress data-clarity-mask data-dd-privacy="mask">
    <AnimatePresence initial={false} mode="wait">
      {view === "new" && <motion.div key="new" className={styles.view} variants={viewTransition} initial="initial" animate="visible" exit="exit">
        {!staff && <ReportForm session={session} profile={profile} onCreated={open} onBack={back} active={active} />}
      </motion.div>}
      {view === "thread" && <motion.div key={`thread-${selected}`} className={styles.view} variants={viewTransition} initial="initial" animate="visible" exit="exit">
        <Conversation id={selected} session={session} secret={session ? undefined : guestReports().find(({ id }) => id === selected)?.secret} staff={staff} active={active} onBack={back} />
      </motion.div>}
      {view === "list" && <motion.div key="list" className={styles.listView} variants={viewTransition} initial="initial" animate="visible" exit="exit">
      <div className={styles.listHeading}><h3 className="type-subheading">{staff ? "Support inbox" : "Your reports"}</h3>{!staff && <button className="rn-button-style--2 rn-btn-green rn-btn-small" onClick={() => setView("new")} type="button"><IconlyPlus size="1.25rem" /> New report</button>}</div>
      {staff && <label className={styles.statusControl}>Filter by status<select className="bgsnl-form-control" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All reports</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}
      {error && <div className={styles.error} role="alert">{error} <button className={styles.textButton} type="button" onClick={refresh}>Try again</button></div>}
      {loading && !items.length ? <div role="status" className={styles.loading}>Loading reports…<div className={styles.skeleton} /><div className={styles.skeleton} /></div> : !items.length && !error ? <div className={styles.empty}>
        <IconlyMessage size="2.5rem" /><h3 className="type-subheading">{staff ? "No reports here" : "Something not working?"}</h3><p>{staff ? "New website reports will appear here. Try a different status filter." : "Send our team a report. You can come back here to read replies and continue the conversation."}</p>
        {!staff && <button className={styles.textButton} type="button" onClick={() => setView("new")}>Report a website problem <IconlyArrowRight size="1.25rem" /></button>}
      </div> : <ul className={styles.reportList}>{items.map((record) => <li key={record.id}><button className={styles.reportItem} type="button" onClick={() => open(record)}>
        <div className={styles.row}><span className={styles.status} data-status={record.status}>{STATUS_LABELS[record.status]}</span><small>#{record.reference}</small></div>
        <strong>{record.subject}</strong>{staff && <span>{record.contact?.name} <small>· {record.contact?.source === "guest" ? "Guest" : "Account"}</small></span>}
        <div className={styles.row}><small>{record.messageCount} {record.messageCount === 1 ? "entry" : "entries"} · {new Date(record.lastMessageAt).toLocaleDateString()}</small><IconlyArrowRight size="1.25rem" /></div>
      </button></li>)}</ul>}
      {(page > 1 || hasMore) && <nav className={styles.row} aria-label="Report pages"><button className={styles.textButton} type="button" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page}</span><button className={styles.textButton} type="button" disabled={!hasMore || loading} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      {!staff && <div className={styles.listFooter}>{session ? <a href="/user#help">Account help</a> : <>
        <small>Guest conversations are private to this browser. On a shared device, forget access when you’re done.</small>
        {guestReports().length > 0 && (confirmForget ? <div className={styles.notice}><p>Forget guest access on this device? Reports stay with our team, but you won’t be able to reopen them here.</p><div className={styles.row}><button className={styles.textButton} type="button" onClick={() => setConfirmForget(false)}>Keep access</button><button className="rn-button-style--2 rn-btn-small" type="button" onClick={forget}>Forget access</button></div></div> : <button className={styles.textButton} type="button" onClick={() => setConfirmForget(true)}>Forget guest access</button>)}
      </>}</div>}
      </motion.div>}
    </AnimatePresence>
  </div>;
}
DeskSession.propTypes = { session: PropTypes.object, staff: PropTypes.bool, active: PropTypes.bool };

export default function SupportDesk({ staff = false, active = true }) {
  const { session } = useSelector(selectUser);
  return <DeskSession key={`${supportScope(session)}:${staff}`} session={session} staff={staff} active={active} />;
}
SupportDesk.propTypes = { staff: PropTypes.bool, active: PropTypes.bool };
