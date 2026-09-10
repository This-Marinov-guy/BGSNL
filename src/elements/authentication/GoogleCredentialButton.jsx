"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import PropTypes from "prop-types";
import { mountGoogleCredentialControl } from "./google-credential-control.mjs";
import styles from "./google-auth.module.scss";

export default function GoogleCredentialButton({ challenge, onCredential, onError, onNotice, onInteraction, busy = false, autoPrompt = false }) {
  const container = useRef(null);
  const handlers = useRef({ onCredential, onError, onNotice, onInteraction });
  handlers.current = { onCredential, onError, onNotice, onInteraction };
  const [ready, setReady] = useState(false);
  const lifecycle = useRef({ active: false, settled: false });

  useEffect(() => {
    lifecycle.current = { active: true, settled: false };
    return () => { lifecycle.current.active = false; };
  }, [challenge]);
  const reportError = useCallback((message) => {
    if (!lifecycle.current.active || lifecycle.current.settled) return;
    lifecycle.current.settled = true;
    handlers.current.onError(message);
  }, []);

  useEffect(() => {
    if (ready) return undefined;
    const timeout = setTimeout(() => reportError("Google could not load. Check your connection and browser content-blocker settings, then refresh the page and try again. Your BGSNL password still works."), 15000);
    return () => clearTimeout(timeout);
  }, [ready, reportError]);

  useEffect(() => {
    if (!ready || !container.current || lifecycle.current.settled) return undefined;
    return mountGoogleCredentialControl({
      googleId: window.google?.accounts?.id, target: container.current, challenge, autoPrompt,
      onCredential: (credential) => {
        if (!lifecycle.current.active || lifecycle.current.settled) return;
        lifecycle.current.settled = true;
        handlers.current.onCredential(credential);
      },
      onError: reportError,
      onNotice: (message) => handlers.current.onNotice?.(message),
      onInteraction: () => handlers.current.onInteraction?.(),
    });
  }, [ready, challenge, autoPrompt, reportError]);

  return (
    <div className={styles.googleControl} aria-busy={busy}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive"
        onReady={() => setReady(true)} onError={() => reportError("Google could not load. Check your connection and browser content-blocker settings, then refresh the page and try again. Your BGSNL password still works.")} />
      {!ready && <p role="status">Loading Google sign-in…</p>}
      <div ref={container} inert={busy ? true : undefined} />
      {busy && <p role="status">Verifying your Google account…</p>}
    </div>
  );
}

GoogleCredentialButton.propTypes = {
  challenge: PropTypes.object.isRequired, onCredential: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired, busy: PropTypes.bool,
  autoPrompt: PropTypes.bool,
  onNotice: PropTypes.func,
  onInteraction: PropTypes.func,
};
