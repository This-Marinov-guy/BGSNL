"use client";

import { useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiChevronDown } from "../icons/IconlyIcons";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";

function DisclosureBody({ children, id }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div id={id} className="animated-disclosure__body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }} inert={!present || undefined} aria-hidden={!present || undefined}>
    <div className="animated-disclosure__content">{children}</div>
  </motion.div>;
}
DisclosureBody.propTypes = { children: PropTypes.node.isRequired, id: PropTypes.string.isRequired };

// Keep native details open until the closing animation completes. The separate
// ref also handles rapid reopen clicks without a stale exit hiding the content.
export default function AnimatedDisclosure({ summary, children, className = "", defaultOpen = false }) {
  const id = useId();
  const [expanded, setExpanded] = useState(defaultOpen);
  const [visible, setVisible] = useState(defaultOpen);
  const expandedRef = useRef(defaultOpen);
  const toggle = event => {
    event.preventDefault();
    const next = !expandedRef.current;
    expandedRef.current = next;
    setExpanded(next);
    if (next) setVisible(true);
  };
  return <details className={`animated-disclosure ${className}`.trim()} open={visible} data-expanded={expanded}>
    <summary className={typeof summary === "string" ? "animated-disclosure__summary" : undefined} onClick={toggle} aria-expanded={expanded} aria-controls={expanded || visible ? id : undefined}>{summary}{typeof summary === "string" && <FiChevronDown className="animated-disclosure__chevron" aria-hidden="true" />}</summary>
    <AnimatePresence initial={false} onExitComplete={() => { if (!expandedRef.current) setVisible(false); }}>
      {expanded && <DisclosureBody key="content" id={id}>{children}</DisclosureBody>}
    </AnimatePresence>
  </details>;
}
AnimatedDisclosure.propTypes = { summary: PropTypes.node.isRequired, children: PropTypes.node.isRequired, className: PropTypes.string, defaultOpen: PropTypes.bool };
