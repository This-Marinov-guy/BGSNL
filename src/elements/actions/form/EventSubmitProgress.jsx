import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";

const STAGES = ["Preparing your event", "Saving event, images and ticket settings", "Opening your dashboard"];

export default function EventSubmitProgress({ step = 0 }) {
  const reduced = useReducedMotion();
  const [takingLonger, setTakingLonger] = useState(false);
  useEffect(() => {
    const timeout = window.setTimeout(() => setTakingLonger(true), 15000);
    return () => window.clearTimeout(timeout);
  }, []);
  return <div className="event-submit-progress" aria-busy="true">
    <img className="event-submit-progress__gif" src="https://media1.tenor.com/images/fc8442a618ad1ef0485d894d64b2b077/tenor.gif" alt="" />
    <h3>Loading…</h3>
    <div className="event-submit-progress__window" aria-hidden="true">
      <motion.ol initial={{ y: 0 }} animate={{ y: -step * 52 }} transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
        {STAGES.map((label, index) => <motion.li key={label} animate={{ opacity: index === step ? 1 : 0.45 }} className={index < step ? "is-complete" : index === step ? "is-current" : ""}>
          <span className="event-submit-progress__marker">{index < step ? "✓" : index + 1}</span><span>{label}</span>
        </motion.li>)}
      </motion.ol>
    </div>
    <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{STAGES[step]}</p>
    <p className="event-submit-progress__hint">{takingLonger ? "Still saving your event. Please keep this window open." : "Please keep this window open until saving finishes."}</p>
  </div>;
}
EventSubmitProgress.propTypes = { step: PropTypes.number };
