"use client";

import { Children, Fragment, isValidElement, useId, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PropTypes from "prop-types";
import { FiChevronDown, FiX } from "../icons/IconlyIcons";
import styles from "./filter-panel.module.scss";

const MOBILE_QUERY = "(max-width: 767px)";
const subscribe = (callback) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getServerSnapshot = () => false;
const classes = (...values) => values.filter(Boolean).join(" ");

const countControls = children => Children.toArray(children).reduce((count, child) =>
  count + (isValidElement(child) && child.type === Fragment ? countControls(child.props.children) : 1), 0);

export default function FilterPanel({ children, onClear, className = "", controlsClassName = "", description = "", summary = null, title = "Filter" }) {
  const id = useId();
  const mobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const expanded = !mobile || open;

  return <section aria-label={typeof title === "string" ? title : "Filter"} className={classes(styles.panel, className)}>
    <button className={styles.toggle} data-filter-toggle type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <span>{typeof title === "string" ? title : "Filter"}</span><FiChevronDown aria-hidden className={expanded ? styles.rotated : undefined} />
    </button>
    <motion.div id={id} initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: expanded ? "visible" : "hidden" }} inert={!expanded || undefined} aria-hidden={!expanded || undefined}>
      <div className={styles.body}>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.controlsRow}>
          <div className={classes(styles.controls, controlsClassName)} data-filter-controls style={{ "--filter-count": countControls(children) }}>
            {children}
            <button type="button" className={styles.clear} data-filter-reset onClick={onClear} aria-label="Clear filters" title="Clear filters"><FiX aria-hidden /><span className={styles.clearText} data-filter-reset-label>Reset</span></button>
          </div>
        </div>
        {summary && <div className={styles.summary}>{summary}</div>}
      </div>
    </motion.div>
  </section>;
}

FilterPanel.propTypes = {
  children: PropTypes.node.isRequired,
  onClear: PropTypes.func.isRequired,
  className: PropTypes.string,
  controlsClassName: PropTypes.string,
  description: PropTypes.node,
  summary: PropTypes.node,
  title: PropTypes.node,
};
