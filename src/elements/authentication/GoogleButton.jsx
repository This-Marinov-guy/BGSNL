import PropTypes from "prop-types";
import styles from "./google-auth.module.scss";

export default function GoogleButton({ children, onClick, disabled = false, busy = false }) {
  return (
    <button type="button" className={styles.googleButton} disabled={disabled || busy} aria-busy={busy} onClick={onClick}>
      <span className={styles.googleLogo} aria-hidden="true">
        <img src="/assets/images/svg/3d/google.png" alt="" width="40" height="40" />
      </span>
      <span>{children}</span>
    </button>
  );
}

GoogleButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  busy: PropTypes.bool,
};
