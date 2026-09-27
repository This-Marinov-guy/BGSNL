import PropTypes from "prop-types";
import styles from "./support.module.scss";

export default function SupportLoading({ inset = false }) {
  return <div role="status" aria-busy="true" className={inset ? styles.listView : styles.loading}>
    <span className="visually-hidden">Loading support…</span>
    <div className={styles.skeleton} aria-hidden="true" />
    <div className={styles.skeleton} aria-hidden="true" />
  </div>;
}

SupportLoading.propTypes = { inset: PropTypes.bool };
