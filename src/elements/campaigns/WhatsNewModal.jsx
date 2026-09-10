"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import styles from "./whats-new.module.scss";

const steps = [
  {
    label: "Wallet card",
    title: "Your membership, ready to go",
    description: "A digital membership card for your phone’s wallet is coming soon. Keep your BGSNL membership close wherever the community takes you.",
    detail: "We’ll share how to add it when it’s ready.",
    image: "/assets/images/svg/3d/card.png",
  },
  {
    label: "New design",
    title: "A fresh look. A familiar community.",
    description: "Your account has a new look, with a clearer profile, easier navigation and your tickets, opportunities and membership settings together in one place.",
    detail: "Explore your account at your own pace.",
    image: "/assets/images/svg/3d/achievement-3d.png",
  },
  {
    label: "Campaigns",
    title: "More ways to stay connected",
    description: "New community campaigns are on the way. Look out for local events, member opportunities and updates from BGSNL.",
    detail: "You’ll hear more as each campaign launches.",
    image: "/assets/images/svg/3d/calendar-3d.png",
  },
];

export default function WhatsNewModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        <div className={styles.hero}>
          <h2>What’s new</h2>
          <img key={current.image} className={styles.art} src={current.image} alt="" width="240" height="200" />
        </div>
      }
      className={styles.modal}
      headerClassName={styles.header}
      contentClassName={styles.body}
      footerClassName={styles.footer}
      actions={
        <>
          <button type="button" className={styles.back} onClick={() => step === 0 ? onClose() : setStep(step - 1)}>
            {step === 0 ? "Skip tour" : "Back"}
          </button>
          <button type="button" className="rn-button-style--2 rn-btn-reverse-green" onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)}>
            {step === steps.length - 1 ? "Explore my account" : "Next"}
          </button>
        </>
      }
    >
      <nav aria-label="What’s new steps" className={styles.steps}>
        {steps.map((item, index) => (
          <button key={item.label} type="button" aria-current={index === step ? "step" : undefined}
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
};
