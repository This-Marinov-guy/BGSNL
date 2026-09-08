"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import GoogleCredentialButton from "./GoogleCredentialButton";
import { createBrowserProof, googleAuthRequest } from "./google-api";
import styles from "./google-auth.module.scss";

export default function GoogleLogin({ onLogin, disabled = false, onPendingChange }) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    setError(""); setChallenge(null);
    (async () => {
      try {
        const config = await googleAuthRequest("google/config");
        if (!active || !config.enabled) return;
        const proof = createBrowserProof();
        const response = await googleAuthRequest("google/login/challenge", { proof });
        if (active) setChallenge({ ...response, proof });
      } catch (failure) { if (active) setError(failure.message); }
    })();
    return () => { active = false; mounted.current = false; };
  }, [attempt]);

  const complete = async (credential) => {
    if (submitting.current || disabled) return;
    submitting.current = true; setBusy(true);
    onPendingChange?.(true);
    try {
      const response = await googleAuthRequest("google/login", { credential, challengeId: challenge.challengeId, proof: challenge.proof });
      if (mounted.current) onLogin(response);
    } catch (failure) {
      if (mounted.current) { setError(failure.message); setChallenge(null); }
    } finally {
      submitting.current = false;
      if (mounted.current) { setBusy(false); onPendingChange?.(false); }
    }
  };

  if (!challenge && !error) return null;
  return (
    <div className={styles.loginGoogle} inert={disabled ? true : undefined}>
      {challenge && <GoogleCredentialButton challenge={challenge} busy={busy} onCredential={complete}
        onError={(message) => { setError(message); setChallenge(null); }} />}
      {error && <div role="alert"><p>{error}</p><button type="button" className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => setAttempt((value) => value + 1)}>Try Google again</button></div>}
    </div>
  );
}

GoogleLogin.propTypes = { onLogin: PropTypes.func.isRequired, disabled: PropTypes.bool, onPendingChange: PropTypes.func };
