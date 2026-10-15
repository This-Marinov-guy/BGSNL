import { useId } from "react";
import PropTypes from "prop-types";
import styles from "./warning-banner.module.scss";

export default function WarningBanner({ title = "Confirmation needed", children, className = "" }) {
  const titleId = useId();
  return <aside className={`${styles.banner} ${className}`.trim()} aria-labelledby={titleId}>
    <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M12 21C5.50558 21 2.95666 20.5387 2.54353 18.2033C2.13039 15.8679 4.77383 11.4774 5.58842 10.0285C8.31257 5.18408 10.1637 3 12 3C13.8363 3 15.6874 5.18408 18.4116 10.0285C19.2262 11.4774 21.8696 15.8679 21.4565 18.2033C21.0444 20.5387 18.4944 21 12 21Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.5V12.395" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.9957 15.895H12.0047" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className={styles.content}><strong id={titleId} className={styles.title}>{title}</strong><div>{children}</div></div>
  </aside>;
}

WarningBanner.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
