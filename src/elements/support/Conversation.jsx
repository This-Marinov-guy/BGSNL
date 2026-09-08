"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { IconlyArrowLeft, IconlyClose, IconlyImage, IconlyScreenshot, IconlySend } from "@/elements/ui/icons/IconlyIcons";
import { supportRequest } from "./support-api";
import { mergeConversation, STATUS_LABELS } from "./support-state.mjs";
import styles from "./support.module.scss";

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

export default function Conversation({ id, token, secret, staff, active, onBack }) {
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
  const stick = useRef(true);
  const pending = useRef(null);
  const pendingScreenshot = useRef(null);
  const mutation = useRef(false);
  const photoInput = useRef(null);
  const inputId = useId();
  const statusInputId = `${inputId}-status`;
  const endpoint = `${staff ? "inbox" : "conversations"}/${id}`;
  const accept = useCallback((incoming) => setRecord((previous) => mergeConversation(previous, incoming)), []);

  useEffect(() => {
    if (!active) return undefined;
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching || mutation.current || document.hidden) return;
      fetching = true;
      try {
        const response = await supportRequest(endpoint, { token, secret, signal: controller.signal });
        if (!controller.signal.aborted) {
          accept(response.conversation);
          if (pending.current && response.conversation.messages.some((message) => message.id === pending.current.id)) {
            pending.current = null; setDraft(""); setPhotos([]);
          }
          if (!pending.current) setError("");
        }
      } catch (failure) {
        if (!controller.signal.aborted) {
          if ([401, 403, 404].includes(failure.status)) setRecord(null);
          setError(failure.message);
        }
      } finally { fetching = false; }
    }
    refresh();
    const timer = setInterval(refresh, 20000);
    document.addEventListener("visibilitychange", refresh);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [active, token, secret, endpoint, accept, reload]);

  useEffect(() => {
    if (!active || !list.current) return;
    if (stick.current) { list.current.scrollTop = list.current.scrollHeight; setNewBelow(false); }
    else setNewBelow(true);
  }, [record?.messageCount, active]);

  async function reply(event) {
    event.preventDefault();
    if (mutation.current || (!draft.trim() && !photos.length)) return;
    const signature = `${draft.trim()}::${photos.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|")}`;
    if (!pending.current || pending.current.signature !== signature) pending.current = { id: crypto.randomUUID(), text: draft.trim(), files: photos, signature };
    mutation.current = true; setBusy(true); setError("");
    try {
      const data = new FormData();
      data.append("id", pending.current.id); data.append("text", pending.current.text);
      for (const file of pending.current.files) data.append("images", file);
      const result = await supportRequest(`${endpoint}/messages`, { token, secret, data });
      stick.current = true; accept(result.conversation); setDraft(""); setPhotos([]); setPhotoError(""); pending.current = null;
    } catch (failure) {
      if ([401, 403, 409, 422, 429].includes(failure.status)) pending.current = null;
      setError(failure.message);
    }
    finally { mutation.current = false; setBusy(false); }
  }

  async function captureScreenshot() {
    if (mutation.current) return;
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
      const result = await supportRequest(`${endpoint}/messages`, { token, secret, data });
      stick.current = true; accept(result.conversation); pendingScreenshot.current = null;
    } catch (failure) {
      if ([401, 403, 409, 422, 429].includes(failure.status)) pendingScreenshot.current = null;
      setError(failure.message || "The screenshot could not be captured. Try attaching a photo instead.");
    } finally { mutation.current = false; setBusy(false); }
  }

  function selectPhotos(event) {
    const selected = [...(event.target.files || [])];
    event.target.value = "";
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
    try { const result = await supportRequest(`${endpoint}/status`, { token, secret, data: { status, revision: record.revision } }); accept(result.conversation); }
    catch (failure) { setError(failure.message); setReload((value) => value + 1); }
    finally { mutation.current = false; setBusy(false); }
  }

  async function older() {
    setOlderLoading(true);
    const height = list.current?.scrollHeight || 0;
    stick.current = false;
    try {
      const result = await supportRequest(`${endpoint}?before=${record.messages[0].order}`, { token, secret });
      accept(result.conversation);
      requestAnimationFrame(() => { if (list.current) list.current.scrollTop += list.current.scrollHeight - height; });
    } catch (failure) { setError(failure.message); }
    finally { setOlderLoading(false); }
  }

  return <section className={styles.conversation} aria-label="Report conversation">
    <div className={styles.threadHeader}>
      <button className={styles.textButton} type="button" onClick={onBack}><IconlyArrowLeft size="1.25rem" /> {staff ? "Inbox" : "Your reports"}</button>
      {record && <><h3 className="type-subheading">{record.subject}</h3><div className={styles.row}><span className={styles.status} data-status={record.status}>{STATUS_LABELS[record.status]}</span><small>#{record.reference}</small></div>
        {staff && <div className={styles.contact}><strong>{record.contact.name}</strong><span>{record.contact.email || record.contact.phone}</span>{record.contact.email && record.contact.phone && <span>{record.contact.phone}</span>}<small>{record.contact.source === "guest" ? "Guest · contact details not verified" : "Signed-in account"}</small><small>Reported page: {record.pagePath}</small>
          {record.environment && <details className={styles.diagnostics}><summary>Device details</summary><span>{[record.environment.deviceType, record.environment.browser, record.environment.platform].filter(Boolean).join(" · ")}</span>{record.environment.viewport?.width && <span>Viewport: {record.environment.viewport.width} × {record.environment.viewport.height}{record.environment.devicePixelRatio ? ` at ${record.environment.devicePixelRatio}×` : ""}</span>}{record.environment.screen?.width && <span>Screen: {record.environment.screen.width} × {record.environment.screen.height}</span>}{record.environment.timezone && <span>{record.environment.timezone}{record.environment.language ? ` · ${record.environment.language}` : ""}</span>}{record.environment.userAgent && <span className={styles.userAgent}>{record.environment.userAgent}</span>}</details>}
        </div>}
        <div className={styles.row}>{staff ? <div className={`${styles.statusControl} rn-form-group`}><label htmlFor={statusInputId}>Status</label><select id={statusInputId} className="bgsnl-form-control" value={record.status} disabled={busy} onChange={(event) => changeStatus(event.target.value)}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div> : record.status !== "closed" && <button className={styles.textButton} type="button" disabled={busy} onClick={() => changeStatus(record.status === "resolved" ? "open" : "resolved")}>{record.status === "resolved" ? "Reopen report" : "Mark as resolved"}</button>}</div>
      </>}
    </div>
    {!record && !error && <p role="status" className={styles.loading}>Loading conversation…</p>}
    {record && <>
      <div className={styles.messages} ref={list} role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions" onScroll={() => { if (list.current) stick.current = list.current.scrollHeight - list.current.scrollTop - list.current.clientHeight < 80; }}>
        {record.messages[0]?.order > 0 && <button className={styles.textButton} type="button" onClick={older} disabled={olderLoading}>{olderLoading ? "Loading…" : "Earlier messages"}</button>}
        {record.messages.map((message) => <article key={message.id} className={message.kind === "status" ? styles.statusMessage : styles.message} data-own={message.author === (staff ? "staff" : "requester")}>
          {message.kind !== "status" && <small className="weight-semibold">{message.author === "staff" ? "BGSNL support" : staff ? record.contact.name : "You"}</small>}
          {message.text && <p>{message.text}</p>}
          {!!message.attachments?.length && <div className={styles.messageAttachments}>{message.attachments.map((attachment, index) => <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.url} aria-label={`Open attached photo ${index + 1}`}><img src={attachment.url} alt={`Support attachment ${index + 1}`} loading="lazy" /></a>)}</div>}
          <time className="type-small" dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        </article>)}
      </div>
      {newBelow && <button className={styles.textButton} type="button" onClick={() => { stick.current = true; list.current.scrollTop = list.current.scrollHeight; setNewBelow(false); }}>Latest messages ↓</button>}
    </>}
    {error && <div role="alert" className={styles.error}>{error} <button className={styles.textButton} type="button" onClick={() => setReload((value) => value + 1)}>Refresh</button></div>}
    {record && (record.status === "closed" || record.messageCount >= 200 ? <p className={styles.closed}>This conversation is {record.status === "closed" ? "closed" : "at its message limit"}. You can still read it, or start a new report.</p> : <form className={styles.composer} onSubmit={reply}>
      {!!photos.length && <div className={styles.photoDrafts} aria-label="Photos to attach">{photos.map((file, index) => <PhotoDraft file={file} disabled={busy || !!pending.current} onRemove={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))} key={`${file.name}-${file.lastModified}-${index}`} />)}</div>}
      {photoError && <small className={styles.photoError} role="alert">{photoError}</small>}
      <div className={styles.composerBar}>
        <div className={`${styles.composerInput} rn-form-group`}><label htmlFor={inputId}>Your reply</label><textarea className="bgsnl-form-control" id={inputId} rows={2} maxLength={4000} value={draft} disabled={busy || !!pending.current} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply…" /></div>
        <div className={styles.composerActions}>
          <input ref={photoInput} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectPhotos} disabled={busy || !!pending.current || photos.length >= MAX_PHOTOS} tabIndex={-1} aria-hidden="true" />
          <div className={styles.composerTools}>
            <button className={styles.composerAction} type="button" onClick={captureScreenshot} disabled={busy || !!pending.current} aria-label={pendingScreenshot.current ? "Retry sending screenshot" : "Capture and send screenshot"} title={pendingScreenshot.current ? "Retry screenshot" : "Capture and send screenshot"}><IconlyScreenshot size="1.35rem" /></button>
            <button className={styles.composerAction} type="button" onClick={() => photoInput.current?.click()} disabled={busy || !!pending.current || photos.length >= MAX_PHOTOS} aria-label="Attach photos" title="Attach photos"><IconlyImage size="1.35rem" /></button>
          </div>
          <button className={`${styles.composerAction} ${styles.sendAction}`} type="submit" disabled={busy || (!draft.trim() && !photos.length)} aria-label={busy ? "Sending reply" : pending.current ? "Retry reply" : "Send reply"} title={pending.current ? "Retry reply" : "Send reply"}><IconlySend size="1.35rem" /></button>
        </div>
      </div>
    </form>)}
  </section>;
}
Conversation.propTypes = { id: PropTypes.string.isRequired, token: PropTypes.string, secret: PropTypes.string, staff: PropTypes.bool, active: PropTypes.bool, onBack: PropTypes.func.isRequired };
