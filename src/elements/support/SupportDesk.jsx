"use client";

import FilterPanel from "@/elements/ui/filters/FilterPanel";

import { SelectInput } from "@/compat/primereact";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { selectUser } from "@/redux/user";
import { IconlyArrowRight, IconlyDocument, IconlyImprove, IconlyMessage } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { forgetGuestReports, guestReports, STATUS_LABELS, SUPPORT_TYPE_LABELS, supportScope } from "./support-state.mjs";
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
  const [newType, setNewType] = useState("problem");
  const startNew = (type) => { setNewType(type); setView("new"); };
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
        {!staff && <ReportForm initialType={newType} session={session} profile={profile} onCreated={open} onBack={back} active={active} />}
      </motion.div>}
      {view === "thread" && <motion.div key={`thread-${selected}`} className={styles.view} variants={viewTransition} initial="initial" animate="visible" exit="exit">
        <Conversation id={selected} session={session} secret={session ? undefined : guestReports().find(({ id }) => id === selected)?.secret} staff={staff} active={active} onBack={back} />
      </motion.div>}
      {view === "list" && <motion.div key="list" className={styles.listView} variants={viewTransition} initial="initial" animate="visible" exit="exit">
      {!staff && <div className={styles.listHeading}><h3 className="type-subheading">Your conversations</h3><div className={styles.newActions}><button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => startNew("problem")} type="button"><IconlyDocument size="1.25rem" /> New report</button><button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => startNew("recommendation")} type="button"><IconlyImprove size="1.25rem" /> New recommendation</button></div></div>}
      {staff && <FilterPanel onClear={() => { setStatus("all"); setPage(1); }}><label>Status<SelectInput className="bgsnl-form-control" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All reports</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectInput></label></FilterPanel>}
      {error && <div className={styles.error} role="alert">{error} <button className={styles.textButton} type="button" onClick={refresh}>Try again</button></div>}
      {loading && !items.length ? <div role="status" className={styles.loading}><div className={styles.skeleton} /><div className={styles.skeleton} /></div> : !items.length && !error ? <div className={styles.empty}>
        <h3 className={`type-subheading ${styles.emptyHeading}`}><IconlyMessage size="2.5rem" /><span>{staff ? "No reports here" : "Need help or have an idea?"}</span></h3><p>{staff ? "New reports and recommendations will appear here. Try a different status filter." : "Send a problem report or recommendation. Come back here to read replies and continue the conversation."}</p>
        {!staff && <button className={styles.textButton} type="button" onClick={() => startNew("problem")}>Report a website problem <IconlyArrowRight size="1.25rem" /></button>}
      </div> : <ul className={styles.reportList}>{items.map((record) => <li key={record.id}><button className={styles.reportItem} type="button" onClick={() => open(record)}>
        <div className={styles.row}><span className={styles.status} data-status={record.status}>{STATUS_LABELS[record.status]}</span><small>#{record.reference}</small></div>
        <small className={styles.requestType}>{SUPPORT_TYPE_LABELS[record.type || "problem"]}</small><strong>{record.subject}</strong>{staff && <span>{record.contact?.name} <small>· {record.contact?.source === "guest" ? "Guest" : "Account"}</small></span>}
        <div className={styles.row}><small>{record.messageCount} {record.messageCount === 1 ? "entry" : "entries"} · {new Date(record.lastMessageAt).toLocaleDateString()}</small><IconlyArrowRight size="1.25rem" /></div>
      </button></li>)}</ul>}
      {(page > 1 || hasMore) && <nav className={styles.row} aria-label="Report pages"><button className={styles.textButton} type="button" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page}</span><button className={styles.textButton} type="button" disabled={!hasMore || loading} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      
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
