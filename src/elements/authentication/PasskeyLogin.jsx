"use client";

import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { showNotification } from "@/redux/notification";
import usePasskeyAction from "./usePasskeyAction";
import { passkeyErrorNotice } from "./passkey-request.mjs";
import styles from "./passkeys.module.scss";
import authStyles from "./google-auth.module.scss";

export default function PasskeyLogin({ onLogin, disabled = false, onPendingChange }) {
  const dispatch = useDispatch();
  const { supported, busy, run } = usePasskeyAction({
    onSuccess: onLogin, onPendingChange,
    onError: (error) => dispatch(showNotification(passkeyErrorNotice(error))),
  });
  return (
    <div className={styles.login}>
      <button type="button" className={authStyles.googleButton} aria-label="Sign in with passkey" title="Sign in with passkey"
        disabled={disabled || busy || supported !== true} aria-busy={busy}
        onClick={() => { if (!disabled && !busy && supported) run({ purpose: "login" }); }}>
        {busy ? <svg className={`${authStyles.googleLogo} ${styles.loginSpinner}`} viewBox="0 0 24 24" width="20" height="20"
          fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" opacity="0.25" />
          <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
        </svg> : <svg className={authStyles.googleLogo} viewBox="0 0 24 24" width="20" height="20"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          <path d="M4 10a8 8 0 0 1 16 0v2M2.5 15l.5-3M7 10a5 5 0 0 1 10 0v3a15 15 0 0 1-2 8M5 19a15 15 0 0 0 2-7v-2M10 10a2 2 0 0 1 4 0v3a17 17 0 0 1-2 8M8 22a19 19 0 0 0 3-10M20 15a19 19 0 0 1-1 5" />
        </svg>}
        <span className={authStyles.passkeyLabel}>Passkey</span>
      </button>
      <span className={styles.screenReaderStatus} role="status">{busy ? "Signing in with passkey…" : ""}</span>
      {supported === false && <p>Passkeys require a supported browser and a secure connection. You can still use your password or Google.</p>}
    </div>
  );
}

PasskeyLogin.propTypes = { onLogin: PropTypes.func.isRequired, disabled: PropTypes.bool, onPendingChange: PropTypes.func };
