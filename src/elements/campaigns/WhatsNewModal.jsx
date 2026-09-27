"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import styles from "./whats-new.module.scss";

const steps = [
  {
    label: "Update",
    title: "Welcome to the new BGSNL v4",
    description: "More to offer our members and the teams behind the scenes. Discover new analytics, a new way to publish events, and easier guest-list tracking, ticket scanning and more (Some features are restricted to active members only).",
    detail: "Explore on your own, or look out for the guided introduction we’re preparing for you.",
    image: "/assets/images/campaigns/version4/update.png",
  },
  {
    label: "Security",
    title: "Security, updated",
    description: "Keeping your account safe should also make it easier to use. You can now connect your Google account or create a passkey for quick, secure access. Hop in from the Settings tab!",
    detail: "Less password juggling. More time for the community.",
    image: "/assets/images/campaigns/version4/security.png",
  },
  {
    label: "Wallet",
    title: "Meet your new membership card",
    description: "Sharing your BGSNL membership is easier than ever. Our new digital cards keep your membership close, wherever the community takes you. Hop in from the Settings or Profile tabs",
    detail: "Add yours to Apple Wallet or Google Wallet for easy access.",
    image: "/assets/images/campaigns/version4/wallet.png",
  },
  {
    label: "Help",
    title: "Help is on the way",
    description: "Meet the IT guy who’s been here for ages… just not visually. His avatar is now part of the website, ready to help with your requests. You can access it from the the Help button on the bottom left at all times!",
    detail: "Give him a little time to find his way around. He’s still new here.",
    image: "/assets/images/campaigns/version4/help.png",
  },
];

export default function WhatsNewModal({ open, onClose, saving = false }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  return (
    <AppModal
      open={open}
      onClose={onClose}
      closable={!saving}
      maximizable={false}
      title={
        <div className={styles.hero}>
          <span className="visually-hidden">What’s new at BGSNL</span>
          <img key={current.image} className={styles.art} src={current.image} alt="" />
        </div>
      }
      className={styles.modal}
      headerClassName={styles.header}
      contentClassName={styles.body}
      footerClassName={styles.footer}
      actions={
        <>
          <button type="button" className={`${styles.back} ${step === 0 ? styles.close : ""}`} disabled={saving} onClick={() => step === 0 ? onClose() : setStep(step - 1)}>
            {step === 0 ? "Close" : "Back"}
          </button>
          <button type="button" disabled={saving} className={`rn-button-style--2 ${step === steps.length - 1 ? "rn-btn-solid-gold" : "rn-btn-reverse-green"}`} onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)}>
            {saving ? "Saving…" : step === steps.length - 1 ? "Let’s roll" : "Next"}
          </button>
        </>
      }
    >
      <nav aria-label="What’s new steps" className={styles.steps}>
        {steps.map((item, index) => (
          <button key={item.label} type="button" disabled={saving} aria-current={index === step ? "step" : undefined}
            onClick={() => setStep(index)}>
            <span aria-hidden="true">{index + 1}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div aria-live="polite" aria-atomic="true">
        <div key={step} className={styles.copy}>
          <h3>{current.title}</h3>
          <p>{current.description}</p>
          <p className={styles.detail}>{current.detail}</p>
        </div>
      </div>
    </AppModal>
  );
}

WhatsNewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};
