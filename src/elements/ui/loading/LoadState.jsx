"use client";

import PropTypes from "prop-types";
import RetryIcon from "@/elements/ui/icons/RetryIcon";
import { FiAlertCircle, IconlyHome } from "@/elements/ui/icons/IconlyIcons";
import styles from "./load-state.module.scss";

export function LoadingSkeleton({ label = "Loading content", variant = "lines", count = 3 }) {
  return <span className={`${styles.skeleton} ${styles[variant]}`} role="status" aria-label={label} aria-busy="true">
    {Array.from({ length: variant === "inline" ? 1 : count }, (_, index) => <span key={index} className={styles.item} aria-hidden="true">
      {(variant === "cards" || variant === "tiers") && <span className={styles.picture} />}
      <span className={styles.line} />
      {variant !== "inline" && <span className={styles.shortLine} />}
    </span>)}
  </span>;
}
LoadingSkeleton.propTypes = { label: PropTypes.string, variant: PropTypes.oneOf(["lines", "inline", "cards", "tiers"]), count: PropTypes.number };

export function RetryButton({ onClick, label = "Try again", disabled = false }) {
  return <button className={styles.retry} type="button" onClick={onClick} aria-label={label} title={label} disabled={disabled}>
    <RetryIcon />
  </button>;
}
RetryButton.propTypes = { onClick: PropTypes.func.isRequired, label: PropTypes.string, disabled: PropTypes.bool };

export function LoadErrorBanner({ message = "This content could not be loaded. Please try again.", onRetry, retryLabel = "Try again", disabled = false, compact = false, showHome = false, children }) {
  return <div className={`${styles.error}${compact ? ` ${styles.compact}` : ""}`} role="alert">
    <div className={styles.message}><FiAlertCircle aria-hidden="true" />{children || message}</div>
    <div className={styles.actions}>
      <RetryButton onClick={onRetry} label={retryLabel} disabled={disabled} />
      {showHome && <a className={styles.retry} href="/" aria-label="Go to home page" title="Go to home page">
        <IconlyHome aria-hidden="true" />
      </a>}
    </div>
  </div>;
}
LoadErrorBanner.propTypes = { message: PropTypes.string, onRetry: PropTypes.func.isRequired, retryLabel: PropTypes.string, disabled: PropTypes.bool, compact: PropTypes.bool, showHome: PropTypes.bool, children: PropTypes.node };
