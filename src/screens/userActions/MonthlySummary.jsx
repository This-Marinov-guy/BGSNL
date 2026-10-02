"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeaderTwo from "@/component/header/HeaderTwo";
import DashboardNavigation from "./DashboardNavigation";
import workspace from "./dashboard-workspace.module.scss";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { IconlyPlus, IconlyDelete } from "@/elements/ui/icons/IconlyIcons";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import styles from "./monthly-summary.module.scss";

const currentMonth = () => {
  const parts = new globalThis.Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find(part => part.type === "year").value}-${parts.find(part => part.type === "month").value}`;
};
const request = async (month, options = {}) => {
  const timeout = AbortSignal.timeout(20000);
  let response;
  try {
    response = await browserFetch(`/api/dashboard/monthly-summary/${month}`, { ...options,
      signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout });
  } catch { throw new Error("We could not reach the monthly summary service. Please try again."); }
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "The monthly summary is unavailable. Please try again.");
  return body;
};

export default function MonthlySummary() {
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState(null);
  const [news, setNews] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [removed, setRemoved] = useState(null);
  const savingRef = useRef(false);
  const dirty = !!summary && JSON.stringify(news) !== JSON.stringify(summary.news);
  const load = useCallback(async (signal) => {
    setLoading(true); setError("");
    try {
      const result = await request(month, { signal });
      if (signal?.aborted) return;
      setSummary(result); setNews(result.news); setSelected(0); setRemoved(null);
    } catch (failure) { if (!signal?.aborted) setError(failure.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [month]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = (key, value) => {
    setNews(items => items.map((item, index) => index === selected ? { ...item, [key]: value } : item));
    setSaved(false); setSaveError("");
  };
  const save = async event => {
    event?.preventDefault();
    if (!summary?.editable || savingRef.current) return;
    const invalid = news.findIndex(item => !item.title.trim() || !item.body.trim() || (item.url && !/^https:\/\//i.test(item.url)));
    if (invalid !== -1) { setSelected(invalid); setSaveError(`Complete the title and text for news item ${invalid + 1}. Links must start with https:// or be left empty.`); return; }
    savingRef.current = true; setSaving(true); setSaveError(""); setSaved(false);
    try {
      const result = await request(month, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ news, revision: summary.revision }) });
      setSummary(previous => ({ ...previous, news: result.news, revision: result.revision }));
      setNews(result.news); setSaved(true); setRemoved(null);
      // A preview failure must not turn a confirmed save into a failed save.
      try { setSummary(await request(month)); }
      catch { setError("News was saved, but the preview could not refresh. Retry to see the saved email."); }
    } catch (failure) { setSaveError(`${failure.message} Your edits are still here.`); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${workspace.page} ${styles.page}`}>
      <DashboardNavigation />
      <header className={`event-workspace-heading ${styles.header}`}><div><h1>Monthly summary</h1></div>
        <div className="rn-form-group"><label htmlFor="summary-month">Month</label><input id="summary-month" type="month" value={month} min="2000-01" max="2099-12" disabled={dirty || saving} onChange={event => {
          if (event.target.value) { setMonth(event.target.value); setSummary(null); setSaved(false); setSaveError(""); }
        }} /></div></header>
      {dirty && <p className={styles.hint}>Save or discard your news edits before changing month.</p>}
      {loading && !summary && <LoadingSkeleton label="Loading monthly summary" count={4} />}
      {error && <LoadErrorBanner message={error} onRetry={() => { if (!dirty) load(); }} disabled={dirty || loading} />}
      {summary && <>
        <section className={styles.overview} aria-label="Monthly email schedule"><h2>{summary.label}</h2>
          <p>{summary.publishedAt ? "This month’s email content has been finalised." : `Scheduled for ${new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: summary.timeZone }).format(new Date(summary.dueAt))} (Amsterdam time).`}</p>
          <p>{summary.recipients.total} eligible recipients now: {summary.recipients.alumni} alumni and {summary.recipients.internal} additional internal contacts. Duplicate addresses receive one email.</p>
          <p>{summary.counts.events} events · {summary.counts.members} new members · {summary.counts.alumni} new alumni</p>
          <p className={styles.hint}>Paid alumni with current benefits and email updates enabled. Figures and recipients are checked again at send time.</p>
        </section>
        <form onSubmit={save} className={styles.editor} noValidate aria-busy={saving}>
          <h2>Society news <span className={styles.hint}>(optional)</span></h2>
          <p>Add up to 10 updates. Leave this empty to send just the events and membership summary.</p>
          {!summary.editable && <p role="status">This month is closed for editing. Choose a future month to add news.</p>}
          {news.length > 0 ? <>
            <div className={styles.items} aria-label="News items">{news.map((item, index) => <button className={styles.control} type="button" key={index} aria-pressed={selected === index} disabled={saving} onClick={() => setSelected(index)}>{index + 1}. {item.title || "Untitled news"}</button>)}</div>
            {news[selected] && <fieldset disabled={saving || !summary.editable} className={styles.fields}>
              <legend>News item {selected + 1}</legend>
              <div className="rn-form-group"><label htmlFor="news-title">Title</label><input id="news-title" value={news[selected].title} maxLength={160} autoComplete="off" onChange={event => update("title", event.target.value)} /></div>
              <div className="rn-form-group"><label htmlFor="news-body">News text</label><textarea id="news-body" value={news[selected].body} rows={5} maxLength={2000} onChange={event => update("body", event.target.value)} /><span className={styles.hint}>{news[selected].body.length}/2,000 characters</span></div>
              <div className="rn-form-group"><label htmlFor="news-url">Read more link (optional)</label><input id="news-url" type="url" inputMode="url" autoComplete="off" value={news[selected].url || ""} maxLength={2048} placeholder="https://" onChange={event => update("url", event.target.value)} /></div>
              <button className={`${styles.control} ${styles.quiet}`} type="button" onClick={() => { setRemoved({ item: news[selected], index: selected }); setNews(items => items.filter((_, index) => index !== selected)); setSelected(0); setSaved(false); }}><IconlyDelete aria-hidden />Remove this news item</button>
            </fieldset>}
          </> : <p className={styles.empty}>No news added. The email will still include this month’s events and new-member counts.</p>}
          {removed && <p role="status">News item removed from this draft. <button className={`${styles.control} ${styles.quiet}`} type="button" disabled={saving} onClick={() => { setNews(items => [...items.slice(0, removed.index), removed.item, ...items.slice(removed.index)]); setSelected(removed.index); setRemoved(null); }}>Undo</button></p>}
          {saveError && <><LoadErrorBanner message={saveError} onRetry={() => save()} disabled={saving} />
            <button className={`${styles.control} ${styles.quiet}`} type="button" disabled={saving} onClick={() => {
              if (!dirty || window.confirm("Reload the saved news? Your unsaved edits will be discarded.")) { setSaveError(""); load(); }
            }}>Reload saved version</button></>}
          {saved && !dirty && <p role="status">News saved for the scheduled monthly email.</p>}
          {summary.editable && <div className={styles.actions}>
            <button type="button" className={styles.control} disabled={saving || news.length >= 10} onClick={() => { setNews(items => [...items, { title: "", body: "", url: "" }]); setSelected(news.length); setSaved(false); setRemoved(null); }}><IconlyPlus aria-hidden />Add news item</button>
            {dirty && <button type="button" className={`${styles.control} ${styles.quiet}`} disabled={saving} onClick={() => { setNews(summary.news); setSelected(0); setRemoved(null); setSaveError(""); }}>Discard edits</button>}
            <button type="submit" className={`${styles.control} ${styles.primary}`} disabled={saving || !dirty}>{saving ? <LoadingSkeleton label="Saving news" variant="inline" /> : "Save news"}</button>
          </div>}
        </form>
        <section className={styles.preview}><h2>Saved email preview</h2><p>{dirty ? "Save your changes to update this preview." : summary.preview.subject}</p>
          <iframe title="Monthly supporter email preview" sandbox="" referrerPolicy="no-referrer" srcDoc={summary.preview.html} />
        </section>
      </>}
    </main>
  </>;
}
