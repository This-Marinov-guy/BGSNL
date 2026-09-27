"use client";

import { useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { IconlyImage, IconlyDelete } from "@/elements/ui/icons/IconlyIcons";
import { SUPPORT_FILE_ACCEPT, validateSupportFiles } from "./support-files.mjs";
import styles from "./support.module.scss";

export default function AttachmentDropzone({ files, onChange, disabled }) {
  const id = useId();
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  function add(selected) {
    if (disabled || !selected.length) return;
    const failure = validateSupportFiles(files, selected);
    setError(failure);
    if (!failure) onChange([...files, ...selected]);
  }
  return <div className={`${styles.attachments} rn-form-group`}>
    <label htmlFor={id}>Attachments <small>(optional)</small></label>
    <input id={id} ref={input} type="file" className={styles.fileInput} accept={SUPPORT_FILE_ACCEPT} multiple disabled={disabled} tabIndex={-1}
      onChange={event => { add(Array.from(event.target.files || [])); event.target.value = ""; }} />
    <button type="button" className={styles.dropzone} data-dragging={dragging} disabled={disabled} aria-describedby={`${id}-hint`} onClick={() => input.current?.click()}
      onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => { event.preventDefault(); setDragging(false); add(Array.from(event.dataTransfer.files)); }}>
      <IconlyImage size="1.75rem" /><span>Drop images or files here, or <strong>browse files</strong></span>
    </button>
    {error && <small role="alert" className={styles.photoError}>{error}</small>}
    {!!files.length && <ul className={styles.attachmentList}>{files.map((file, index) => <li key={`${file.name}-${index}`}>
      <span>{file.name} <small>({Math.max(1, Math.round(file.size / 1024))} KB)</small></span>
      <button type="button" className={`${styles.iconButton} ${styles.closeButton}`} disabled={disabled} aria-label={`Remove ${file.name}`} onClick={() => { onChange(files.filter((_, item) => item !== index)); setError(""); }}><IconlyDelete size="1.25rem" /></button>
    </li>)}</ul>}
  </div>;
}
AttachmentDropzone.propTypes = { files: PropTypes.array.isRequired, onChange: PropTypes.func.isRequired, disabled: PropTypes.bool };
