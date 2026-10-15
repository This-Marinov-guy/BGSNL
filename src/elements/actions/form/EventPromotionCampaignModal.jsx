"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import AppModal from "@/elements/ui/modals/AppModal";
import styles from "./event-promotion-campaign.module.scss";
import { showNotification } from "../../../redux/notification";

export default function EventPromotionCampaignModal({ open, eventTitle, changes, onClose, onConfirm }) {
  const dispatch = useDispatch();
  const [reviewEmail, setReviewEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setReviewEmail(true);
  }, [open]);

  const confirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await onConfirm(reviewEmail);
      if (!result) dispatch(showNotification({ severity: "error", summary: "Event could not be saved", detail: "Your changes are still here. Check your connection and try again." }));
    } catch {
      dispatch(showNotification({ severity: "error", summary: "Event could not be saved", detail: "Your changes are still here. Please try again." }));
    } finally {
      setSaving(false);
    }
  };

  return <AppModal open={open} onClose={onClose} title="Promote this event update?" maximizable={false}
    closable={!saving} initialFocusRef={cancelRef} className={styles.modal}
    actions={<>
      <button type="button" className="event-form-button event-form-button--primary" onClick={confirm} disabled={saving} aria-busy={saving}>
        {saving ? <><span className="event-form-button__spinner" aria-hidden="true" />Saving…</> : reviewEmail ? "Save & prepare email" : "Save event only"}
      </button>
    </>}>
    <div className={styles.content}>
      <p className={styles.intro}>You added a promotable offer to <strong>{eventTitle || "this event"}</strong>.</p>
      <div className={styles.changes}>
        <h3>What changed</h3>
        <ul>{changes.map(change => <li key={change}>{change}</li>)}</ul>
      </div>
      <label className={styles.choice}>
        <span className={styles.choiceCopy}><strong>Prepare a promotional email after saving</strong><span>Choose the audience and see the eligible email count before sending.</span></span>
        <input type="checkbox" role="switch" checked={reviewEmail} onChange={event => setReviewEmail(event.target.checked)} disabled={saving} />
        <span className={styles.switch} aria-hidden="true" />
      </label>
    </div>
  </AppModal>;
}

EventPromotionCampaignModal.propTypes = {
  open: PropTypes.bool.isRequired,
  eventTitle: PropTypes.string,
  changes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
