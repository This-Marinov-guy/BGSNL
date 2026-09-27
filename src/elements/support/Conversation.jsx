"use client";

import Image from "next/image";
import RetryIcon from "@/elements/ui/icons/RetryIcon";
import { IconlyRotate } from "@/elements/ui/icons/IconlyIcons";
import { PhoneActions } from "@/elements/ui/dashboard/DashboardActions";

import { SelectInput } from "@/compat/primereact";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AnimatedDisclosure from "../ui/functional/AnimatedDisclosure";
import { IconlyArrowLeft, IconlyAttach, IconlyBug, IconlyClose, IconlyDanger, IconlyImprove, IconlyProfile, IconlyScreenshot, IconlySend } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { mergeConversation, STATUS_LABELS, SUPPORT_TYPE_LABELS, supportReplyRestriction, supportStatusChange } from "./support-state.mjs";
import styles from "./support.module.scss";
import SupportLoading from "./SupportLoading";
import { watchSupportLive } from "./support-live.mjs";
import { markSupportSeen } from "./support-unread.mjs";
import { isTemporarySupportError } from "./support-errors.mjs";
import { supportScope } from "./support-state.mjs";

const formatTime = (value) => new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const PHOTO_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function PhotoDraft({ file, onRemove, disabled }) {
  const [source, setSource] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className={styles.photoDraft}>
    {source && <img src={source} alt="Selected attachment preview" />}
    <button type="button" className={styles.photoRemove} onClick={onRemove} disabled={disabled} aria-label="Remove attached photo"><IconlyClose size="1rem" /></button>
  </div>;
}
PhotoDraft.propTypes = { file: PropTypes.object.isRequired, onRemove: PropTypes.func.isRequired, disabled: PropTypes.bool };

export default function Conversation({ id, session, secret, staff, active, onBack }) {
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [busy, setBusy] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [newBelow, setNewBelow] = useState(false);
  const [reload, setReload] = useState(0);
  const list = useRef(null);
  const detailsPanel = useRef(null);
  const messageContent = useRef(null);
  const prependAnchor = useRef(null);
  const olderRequest = useRef(null);
  const stick = useRef(true);
  const pending = useRef(null);
  const pendingScreenshot = useRef(null);
  const mutation = useRef(false);
  const photoInput = useRef(null);
  const inputId = useId();
  const statusInputId = `${inputId}-status`;
  const endpoint = `${staff ? "inbox" : "conversations"}/${id}`;
  const replyRestriction = supportReplyRestriction(record, staff);
  const accept = useCallback((incoming) => setRecord((previous) => mergeConversation(previous, incoming)), []);

  useEffect(() => {
    if (!active) detailsPanel.current?.close();
  }, [active]);

  useEffect(() => {
    const mark = () => {
      if (active && record && !document.hidden) markSupportSeen(`${supportScope(session)}:${staff ? "staff" : "requester"}`, record);
    };
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [active, record, session, staff]);

  useEffect(() => {
    if (!active) return undefined;
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching || mutation.current || document.hidden) return;
      fetching = true;
      try {
        const response = await supportRequest(`${endpoint}?limit=20`, { session, secret, signal: controller.signal });
        if (!controller.signal.aborted) {
          accept(response.conversation);
          if (pending.current && response.conversation.messages.some((message) => message.id === pending.current.id)) {
            pending.current = null; setDraft(""); setPhotos([]);
          }
          if (!pending.current) setError("");
        }
      } catch (failure) {
        if (!controller.signal.aborted && !isTemporarySupportError(failure)) {
          if ([401, 403, 404].includes(failure.status)) setRecord(null);
          setError(failure.message);
        }
        throw failure;
      } finally { fetching = false; }
    }
    const stop = watchSupportLive({ refresh, secret, subscription: () => ({ conversationId: id, staff }), isActive: () => !mutation.current });
    return () => { controller.abort(); stop(); };
  }, [active, session, secret, endpoint, accept, reload, id, staff]);

  useLayoutEffect(() => {
    if (!active || !list.current) return;
    if (prependAnchor.current) {
      const anchor = prependAnchor.current;
      list.current.scrollTop = anchor.top + list.current.scrollHeight - anchor.height;
      prependAnchor.current = null;
      return;
    }
    if (stick.current) { list.current.scrollTop = list.current.scrollHeight; setNewBelow(false); }
    else setNewBelow(true);
  }, [record?.messages, active]);

  useEffect(() => {
    if (!active || !messageContent.current || !list.current) return undefined;
    const resize = new ResizeObserver(() => {
      if (stick.current && list.current) list.current.scrollTop = list.current.scrollHeight;
    });
    resize.observe(messageContent.current);
    resize.observe(list.current);
    return () => resize.disconnect();
  }, [active, !!record]);

  useEffect(() => {
    if (active) setOlderLoading(false);
    return () => olderRequest.current?.abort();
  }, [id, active]);

  async function reply(event) {
    event.preventDefault();
    if (!record || replyRestriction || mutation.current || (!draft.trim() && !photos.length)) return;
    const signature = `${draft.trim()}::${photos.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|")}`;
    if (!pending.current || pending.current.signature !== signature) pending.current = { id: crypto.randomUUID(), text: draft.trim(), files: photos, signature };
    mutation.current = true; setBusy(true); setError("");
    try {
      const data = new FormData();
      data.append("id", pending.current.id); data.append("text", pending.current.text);
      for (const file of pending.current.files) data.append("images", file);
      const result = await supportRequest(`${endpoint}/messages`, { session, secret, data });
      stick.current = true; accept(result.conversation); setDraft(""); setPhotos([]); setPhotoError(""); pending.current = null;
    } catch (failure) {
      if ([401, 403, 409, 422, 429].includes(failure.status)) pending.current = null;
      if (failure.status === 409) setReload((value) => value + 1);
      setError(failure.message);
    }
    finally { mutation.current = false; setBusy(false); }
  }

  async function captureScreenshot() {
    if (!record || replyRestriction || mutation.current) return;
    mutation.current = true; setBusy(true); setError(""); setPhotoError("");
    try {
      if (!pendingScreenshot.current) {
        const html2canvas = (await import("html2canvas")).default;
        const captureScale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(5_000_000 / (window.innerWidth * window.innerHeight)));
        const canvas = await html2canvas(document.documentElement, {
          backgroundColor: "#ffffff",
          height: window.innerHeight,
          logging: false,
          onclone: (clonedDocument) => { clonedDocument.documentElement.style.position = "relative"; },
          scale: captureScale,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          useCORS: true,
          width: window.innerWidth,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          x: window.scrollX,
          y: window.scrollY,
        });
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
        if (!blob) throw new Error("The screenshot could not be prepared.");
        if (blob.size > MAX_PHOTO_BYTES) throw new Error("The screenshot is larger than 5 MB. Try again at a smaller browser size.");
        pendingScreenshot.current = {
          id: crypto.randomUUID(),
          file: new File([blob], `website-screenshot-${new Date().toISOString().replaceAll(":", "-")}.jpg`, { type: "image/jpeg", lastModified: Date.now() }),
        };
      }
      const data = new FormData();
      data.append("id", pendingScreenshot.current.id); data.append("text", ""); data.append("images", pendingScreenshot.current.file);
      const result = await supportRequest(`${endpoint}/messages`, { session, secret, data });
      stick.current = true; accept(result.conversation); pendingScreenshot.current = null;
    } catch (failure) {
      if ([401, 403, 409, 422, 429].includes(failure.status)) pendingScreenshot.current = null;
      if (failure.status === 409) setReload((value) => value + 1);
      setError(failure.message || "The screenshot could not be captured. Try attaching a photo instead.");
    } finally { mutation.current = false; setBusy(false); }
  }

  function selectPhotos(event) {
    const selected = [...(event.target.files || [])];
    event.target.value = "";
    if (!record || replyRestriction) return;
    if (!selected.length) return;
    if (photos.length + selected.length > MAX_PHOTOS) { setPhotoError(`Attach up to ${MAX_PHOTOS} photos.`); return; }
    const invalidType = selected.some((file) => !PHOTO_TYPES.has(file.type));
    if (invalidType) { setPhotoError("Choose JPEG, PNG or WebP photos."); return; }
    const tooLarge = selected.some((file) => file.size > MAX_PHOTO_BYTES);
    if (tooLarge) { setPhotoError("Each photo must be 5 MB or smaller."); return; }
    setPhotoError(""); setPhotos((current) => [...current, ...selected]);
  }

  async function changeStatus(status) {
    if (mutation.current) return;
    mutation.current = true; setBusy(true); setError("");
    try { const result = await supportRequest(`${endpoint}/status`, { session, secret, data: { status, revision: record.revision } }); accept(result.conversation); }
    catch (failure) { setError(failure.message); setReload((value) => value + 1); }
    finally { mutation.current = false; setBusy(false); }
  }

  async function older() {
    if (olderRequest.current || record?.before == null || !active) return;
    const controller = new AbortController();
    olderRequest.current = controller;
    setOlderLoading(true);
    stick.current = false;
    try {
      const result = await supportRequest(`${endpoint}?before=${record.before}&limit=20`, { session, secret, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (list.current) prependAnchor.current = { height: list.current.scrollHeight, top: list.current.scrollTop };
      accept(result.conversation);
    } catch (failure) { if (!controller.signal.aborted) setError(failure.message); }
    finally { if (olderRequest.current === controller) olderRequest.current = null; if (!controller.signal.aborted) setOlderLoading(false); }
  }

  return <section className={styles.conversation} aria-label="Report conversation">
    <div className={styles.threadHeader}>
      <div className={styles.threadHeadingRow}>
        <button className={styles.textButton} type="button" onClick={onBack}><IconlyArrowLeft size="1.25rem" /> Back to tickets</button>
        {record && <div className={styles.threadTools}><small className={styles.ticketReference}><span className={styles.ticketTypeIcon} data-type={record.type || "problem"} title={SUPPORT_TYPE_LABELS[record.type || "problem"]}>{record.type === "recommendation" ? <IconlyImprove size="1.25rem" title="Recommendation" /> : <IconlyBug size="1.25rem" title="Problem report" />}</span>#{record.reference}</small>{staff && <button type="button" className={styles.detailsButton} aria-label="Open requester details" aria-haspopup="dialog" onClick={() => detailsPanel.current?.showModal()}><IconlyProfile size="1.25rem" /></button>}</div>}
      </div>
      {record && <><div className={styles.threadHeadingRow}><h3 className="type-subheading">{record.subject}</h3>{staff ? <div className={styles.statusControl} data-status={record.status}><SelectInput id={statusInputId} aria-label="Ticket status" value={record.status} disabled={busy} onChange={(event) => changeStatus(event.target.value)}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectInput></div> : <span className={`${styles.status} ${styles.ticketStatusBadge}`} data-status={record.status}>{STATUS_LABELS[record.status]}</span>}</div>
        {staff && <dialog ref={detailsPanel} className={styles.detailsPanel} aria-labelledby={`${inputId}-details-title`}>
          <header className={styles.detailsPanelHeader}><h3 id={`${inputId}-details-title`} className="type-subheading">Requester details</h3><button type="button" className={`${styles.iconButton} ${styles.closeButton}`} aria-label="Close requester details" onClick={() => detailsPanel.current?.close()}><IconlyClose size="1.25rem" /></button></header>
          <div className={styles.contact}><strong>{record.contact.name}</strong><span>{record.contact.email || <PhoneActions phone={record.contact.phone} />}</span>{record.contact.email && record.contact.phone && <span><PhoneActions phone={record.contact.phone} /></span>}<small>{record.contact.source === "guest" ? "Guest · contact details not verified" : "Signed-in account"}</small><small>Reported page: {record.pagePath}</small>
          {record.environment && <AnimatedDisclosure className={styles.diagnostics} summary="Device details"><span>{[record.environment.deviceType, record.environment.browser, record.environment.platform].filter(Boolean).join(" · ")}</span>{record.environment.viewport?.width && <span>Viewport: {record.environment.viewport.width} × {record.environment.viewport.height}{record.environment.devicePixelRatio ? ` at ${record.environment.devicePixelRatio}×` : ""}</span>}{record.environment.screen?.width && <span>Screen: {record.environment.screen.width} × {record.environment.screen.height}</span>}{record.environment.timezone && <span>{record.environment.timezone}{record.environment.language ? ` · ${record.environment.language}` : ""}</span>}{record.environment.userAgent && <span className={styles.userAgent}>{record.environment.userAgent}</span>}</AnimatedDisclosure>}
        </div></dialog>}
      </>}
    </div>
    {!record && !error && <SupportLoading inset />}
    {record && <div className={styles.messagesViewport}>
      <div className={styles.messages} ref={list} role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions" tabIndex={0} onScroll={() => {
        if (!list.current) return;
        stick.current = list.current.scrollHeight - list.current.scrollTop - list.current.clientHeight < 80;
        setNewBelow(!stick.current);
        if (!stick.current && list.current.scrollTop < 160) void older();
      }}>
        <div className={styles.messageContent} ref={messageContent}>
        {record.before != null && <button className={styles.textButton} type="button" onClick={older} disabled={olderLoading}>{olderLoading ? "Loading earlier messages…" : "Load earlier messages"}</button>}
        {record.messages.map((message) => {
          const changedStatus = supportStatusChange(message);
          return <article key={message.id} className={message.kind === "status" ? styles.statusMessage : styles.message} data-own={message.author === (staff ? "staff" : "requester")}>
          {message.kind !== "status" && (message.author === "staff"
            ? <small className={`${styles.supportAuthor} weight-semibold`}><Image className={styles.supportAvatar} src="/assets/images/vladi/head.png" alt="" width={24} height={33} /><span>Support</span></small>
            : <small className="weight-semibold">{staff ? record.contact.name : "You"}</small>)}
          {message.text && <p>{changedStatus ? <>Status changed to <span className={`${styles.status} ${styles.ticketStatusBadge}`} data-status={changedStatus}>{STATUS_LABELS[changedStatus]}</span></> : message.text}</p>}
          {!!message.attachments?.length && <div className={styles.messageAttachments}>{message.attachments.map((attachment, index) => <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.url} aria-label={attachment.type === "file" ? `Download ${attachment.name}` : `Open attached photo ${index + 1}`}>{attachment.type === "file" ? <span className={styles.attachedFile}>{attachment.name || "Download file"}</span> : <img src={attachment.url} alt={`Support attachment ${index + 1}`} loading="lazy" />}</a>)}</div>}
          <time className="type-small" dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        </article>; })}
        </div>
      </div>
      <button className={`${styles.textButton} ${styles.backToBottom}`} data-visible={newBelow} inert={!newBelow} aria-hidden={!newBelow} tabIndex={newBelow ? 0 : -1} type="button" onClick={() => { stick.current = true; list.current.scrollTop = list.current.scrollHeight; list.current.focus({ preventScroll: true }); setNewBelow(false); }}>Back to bottom</button>
    </div>}
    {error && <div role="alert" className={styles.error}>{error} <button className={styles.textButton} type="button" onClick={() => setReload((value) => value + 1)}><RetryIcon />Refresh</button></div>}
    {record && (replyRestriction ? <div className={styles.closed} role="status"><IconlyDanger size="1.25rem" /><p>{replyRestriction}</p></div> : <form className={styles.composer} onSubmit={reply}>
      {record.status === "resolved" && <div className={styles.closed} role="status"><IconlyDanger size="1.25rem" /><p>This ticket is resolved. Replying will reopen it.</p></div>}
      {!!photos.length && <div className={styles.photoDrafts} aria-label="Photos to attach">{photos.map((file, index) => <PhotoDraft file={file} disabled={busy || !!pending.current} onRemove={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))} key={`${file.name}-${file.lastModified}-${index}`} />)}</div>}
      {photoError && <small className={styles.photoError} role="alert">{photoError}</small>}
      <div className={styles.composerBar}>
        <div className={`${styles.composerInput} rn-form-group`}><label htmlFor={inputId}>Your reply</label><textarea className="bgsnl-form-control" id={inputId} rows={2} maxLength={4000} value={draft} disabled={busy || !!pending.current} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          event.preventDefault();
          if (!event.repeat && !busy && !mutation.current && !pending.current && (draft.trim() || photos.length)) event.currentTarget.form?.requestSubmit();
        }} placeholder="Write a reply…" /></div>
        <div className={styles.composerActions}>
          <input ref={photoInput} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectPhotos} disabled={busy || !!pending.current || photos.length >= MAX_PHOTOS} tabIndex={-1} aria-hidden="true" />
          <div className={styles.composerTools}>
            <button className={styles.composerAction} type="button" onClick={captureScreenshot} disabled={busy || !!pending.current} aria-label={pendingScreenshot.current ? "Retry sending screenshot" : "Capture and send screenshot"}>{pendingScreenshot.current ? <IconlyRotate size="1.35rem" /> : <IconlyScreenshot size="1.35rem" />}</button>
            <button className={styles.composerAction} type="button" onClick={() => photoInput.current?.click()} disabled={busy || !!pending.current || photos.length >= MAX_PHOTOS} aria-label="Attach images"><IconlyAttach size="1.35rem" /></button>
          </div>
          <button className={`${styles.composerAction} ${styles.sendAction}`} type="submit" disabled={busy || (!draft.trim() && !photos.length)} aria-label={busy ? "Sending reply" : pending.current ? "Retry reply" : "Send reply"}>{!busy && pending.current ? <IconlyRotate size="1.35rem" /> : <IconlySend size="1.35rem" />}</button>
        </div>
      </div>
    </form>)}
  </section>;
}
Conversation.propTypes = { id: PropTypes.string.isRequired, session: PropTypes.object, secret: PropTypes.string, staff: PropTypes.bool, active: PropTypes.bool, onBack: PropTypes.func.isRequired };
