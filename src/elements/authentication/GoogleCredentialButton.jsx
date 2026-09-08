"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import PropTypes from "prop-types";
import styles from "./google-auth.module.scss";

export default function GoogleCredentialButton({ challenge, onCredential, onError, busy = false }) {
  const container = useRef(null);
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    const timeout = setTimeout(() => handlers.current.onError("Google could not load. Check your connection or use your password."), 15000);
    return () => clearTimeout(timeout);
  }, [ready]);

  useEffect(() => {
    const remaining = new Date(challenge.expiresAt).getTime() - Date.now();
    const timeout = setTimeout(() => handlers.current.onError("This Google sign-in request expired. Please try again."), Math.max(0, remaining));
    return () => clearTimeout(timeout);
  }, [challenge]);

  useEffect(() => {
    if (!ready || !container.current || !window.google?.accounts?.id) return undefined;
    const target = container.current;
    let active = true;
    target.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: challenge.clientId, nonce: challenge.nonce,
      auto_select: false, button_auto_select: false, use_fedcm_for_button: true, ux_mode: "popup",
      callback: (response) => {
        if (active && response.credential) handlers.current.onCredential(response.credential);
      },
    });
    window.google.accounts.id.renderButton(target, {
      theme: "outline", size: "large", shape: "rectangular", text: "continue_with",
      width: Math.min(400, Math.max(200, Math.floor(target.clientWidth))),
    });
    return () => { active = false; target.replaceChildren(); };
  }, [ready, challenge]);

  return (
    <div className={styles.googleControl} aria-busy={busy}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive"
        onReady={() => setReady(true)} onError={() => handlers.current.onError("Google could not load. Please use your password or try again.")} />
      {!ready && <p role="status">Loading Google sign-in…</p>}
      <div ref={container} inert={busy ? true : undefined} />
      {busy && <p role="status">Verifying your Google account…</p>}
    </div>
  );
}

GoogleCredentialButton.propTypes = {
  challenge: PropTypes.object.isRequired, onCredential: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired, busy: PropTypes.bool,
};
