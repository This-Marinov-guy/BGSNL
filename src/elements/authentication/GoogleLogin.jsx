"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { showNotification } from "@/redux/notification";
import GoogleCredentialButton from "./GoogleCredentialButton";
import GoogleButton from "./GoogleButton";
import { createBrowserProof, googleAuthRequest } from "./google-api";
import { createGoogleFeedbackGate } from "./google-feedback.mjs";
import styles from "./google-auth.module.scss";

export default function GoogleLogin({ onLogin, disabled = false, onPendingChange }) {
  const dispatch = useDispatch();
  const [challenge, setChallenge] = useState(null);
  const [failed, setFailed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [feedback] = useState(createGoogleFeedbackGate);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(false);
  const notifyError = useCallback((message) => {
    setFailed(true);
    const notification = feedback.error(message);
    if (notification) dispatch(showNotification(notification));
  }, [dispatch, feedback]);

  useEffect(() => () => feedback.clear(), [feedback]);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    setFailed(false); setChallenge(null);
    (async () => {
      try {
        const config = await googleAuthRequest("google/config");
        if (!active) return;
        if (!config.enabled) {
          const notification = feedback.error("Google sign-in is not enabled. Please use your BGSNL password.");
          if (notification) dispatch(showNotification(notification));
          return;
        }
        const proof = createBrowserProof();
        const response = await googleAuthRequest("google/login/challenge", { proof });
        if (active) setChallenge({ ...response, proof });
      } catch (failure) { if (active) notifyError(failure.message); }
      finally { if (active) setPreparing(false); }
    })();
    return () => { active = false; mounted.current = false; };
  }, [attempt, notifyError, feedback, dispatch]);

  const complete = async (credential) => {
    if (submitting.current || disabled || !challenge) return;
    feedback.begin();
    submitting.current = true; setBusy(true);
    onPendingChange?.(true);
    try {
      const response = await googleAuthRequest("google/login", { credential, challengeId: challenge.challengeId, proof: challenge.proof });
      if (mounted.current) { feedback.clear(); onLogin(response); }
    } catch (failure) {
      if (mounted.current) { notifyError(failure.message); setChallenge(null); }
    } finally {
      submitting.current = false;
      if (mounted.current) { setBusy(false); onPendingChange?.(false); }
    }
  };

  if (!challenge && !failed && !preparing) return null;
  return (
    <div className={styles.loginGoogle} inert={disabled ? true : undefined}>
      {challenge ? <GoogleCredentialButton challenge={challenge} busy={busy} onCredential={complete}
        onInteraction={feedback.begin}
        onNotice={(message) => {
          const notification = feedback.notice(message);
          if (notification) dispatch(showNotification(notification));
        }}
        onError={(message) => { notifyError(message); setChallenge(null); }} />
        : <GoogleButton disabled={disabled || busy || preparing} busy={preparing}
          onClick={() => {
            if (disabled || busy || preparing) return;
            feedback.begin(); setPreparing(true); setAttempt((value) => value + 1);
          }}>
          <span className={styles.providerFullLabel}>Continue with Google</span>
          <span className={styles.providerShortLabel}>Google</span>
        </GoogleButton>}
    </div>
  );
}

GoogleLogin.propTypes = { onLogin: PropTypes.func.isRequired, disabled: PropTypes.bool, onPendingChange: PropTypes.func };
