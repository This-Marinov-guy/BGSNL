"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import { useHttpClient } from "@/hooks/common/http-hook";
import { serverEndpoint } from "@/util/defines/common";
import styles from "./backoffice.module.scss";

const roleLabel = (role) => role.replaceAll("_", " ");
const roleList = (roles) => roles?.length ? roles.map(roleLabel).join(", ") : "None";

export default function BulkRolesImport({ onClose, onApplied }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const { sendRequest } = useHttpClient();

  const chooseFile = (event) => {
    const nextFile = event.target.files?.[0] || null;
    if (nextFile && (!nextFile.name.toLowerCase().endsWith(".xlsx") || nextFile.size > 1024 * 1024)) {
      setFile(null);
      setError("Choose an .xlsx file smaller than 1 MB.");
      event.target.value = "";
      return;
    }
    setFile(nextFile);
    setError("");
  };

  const downloadTemplate = async () => {
    if (downloading) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(`${serverEndpoint}backoffice/accounts/bulk-roles/template`, { credentials: "include" });
      if (!response.ok) throw new Error("The template could not be downloaded. Please try again.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "account-role-import.xlsx";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) { setError(downloadError.message); }
    finally { setDownloading(false); }
  };

  const review = async (event) => {
    event.preventDefault();
    if (!file || busy) return;
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await sendRequest("backoffice/accounts/bulk-roles/preview", "POST", form, {}, true, false);
      if (result?.rows) setPreview(result);
      else setError("The import could not be reviewed. Check the file and try again.");
    } finally { setBusy(false); }
  };

  const apply = async () => {
    if (busy || !preview || preview.errorCount || !preview.changeCount) return;
    setBusy(true);
    setError("");
    try {
      const rows = preview.rows.map((row) => ({
        id: row.id, type: row.type, revision: row.revision, email: row.email,
        roles: row.requestedRoles.length ? row.requestedRoles.join(", ") : "none",
      }));
      const result = await sendRequest("backoffice/accounts/bulk-roles/apply", "POST", { rows }, {}, true, false);
      if (typeof result?.updated === "number") onApplied(result);
      else setError("The changes could not be applied. Upload the file and review it again.");
    } finally { setBusy(false); }
  };

  return <AppModal
    open
    onClose={() => { if (!busy) onClose(); }}
    title="Import account roles"
    urlKey="account-role-import"
    className={styles.importModal}
    maximizable={false}
    closable={!busy}
    actions={<div className={styles.importActions}>
      {preview ? <button type="button" className={styles.importBack} disabled={busy} onClick={() => { setPreview(null); setError(""); }}>Back to file</button> : <button type="button" className={styles.importBack} disabled={busy} onClick={onClose}>Cancel</button>}
      {preview ? <button type="button" className={styles.primaryButton} disabled={busy || Boolean(preview.errorCount) || !preview.changeCount} onClick={apply}>{busy ? "Applying…" : `Apply ${preview.changeCount} ${preview.changeCount === 1 ? "change" : "changes"}`}</button> : <button type="submit" form="account-role-import-form" className={styles.primaryButton} disabled={busy || !file}>{busy ? "Reviewing…" : "Review changes"}</button>}
    </div>}
  >
    <div className={styles.importBody} aria-busy={busy}>
      <ol className={styles.importSteps} aria-label="Import steps">
        <li aria-current={!preview ? "step" : undefined}><span>1</span> Import file</li>
        <li aria-current={preview ? "step" : undefined}><span>2</span> Review</li>
      </ol>
      {!preview ? <form id="account-role-import-form" onSubmit={review} className={styles.importForm}>
        <p>Upload an Excel sheet to match members or alumni by email and update their editable roles.</p>
        <p>List the complete set of editable roles for each account. Enter <strong>none</strong> to remove all editable roles. Base and protected roles are kept.</p>
        <button type="button" className={styles.templateLink} disabled={downloading} onClick={downloadTemplate}>{downloading ? "Downloading template…" : "Download Excel template"}</button>
        <label className={styles.importFile} htmlFor="account-role-import-file">
          <strong>Excel file</strong>
          <span>{file ? file.name : "Choose an .xlsx file, up to 1 MB and 200 accounts"}</span>
        </label>
        <input id="account-role-import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required onChange={chooseFile} />
      </form> : <div className={styles.importReview}>
        <p className={styles.importSummary} role="status">{preview.changeCount} to change · {preview.unchangedCount} unchanged · {preview.errorCount} {preview.errorCount === 1 ? "error" : "errors"}</p>
        {preview.errorCount > 0 && <p className={styles.importWarning}>Resolve the listed errors, then upload the sheet again. Some accounts may require a different administrator.</p>}
        {!preview.errorCount && !preview.changeCount && <p>All roles already match the spreadsheet.</p>}
        <div className={styles.importRows}>
          {preview.rows.map(row => <article key={row.row} className={styles.importRow} data-status={row.status}>
            <div className={styles.importRowHeading}><strong>Row {row.row}: {row.email || "Missing email"}</strong><span>{row.status === "change" ? "Change" : row.status === "unchanged" ? "Unchanged" : "Error"}</span></div>
            {row.type && <p>{row.name ? `${row.name} · ` : ""}{row.type === "alumni" ? "Alumni" : "Member"}</p>}
            {row.status === "error" ? <p className={styles.importRowError}>{row.message}</p> : <dl><div><dt>Current editable roles</dt><dd>{roleList(row.currentRoles)}</dd></div><div><dt>After import</dt><dd>{roleList(row.requestedRoles)}</dd></div></dl>}
          </article>)}
        </div>
      </div>}
      {error && <p role="alert" className={styles.importWarning}>{error}</p>}
    </div>
  </AppModal>;
}

BulkRolesImport.propTypes = {
  onClose: PropTypes.func.isRequired,
  onApplied: PropTypes.func.isRequired,
};
