"use client";

import { useEffect, useRef, useState } from "react";
import HeaderTwo from "@/component/header/HeaderTwo";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { SESSION_NOTICE_KEY, announceSessionChange } from "@/util/auth/browser-session.mjs";

function returnToProfile(severity, detail) {
  try { sessionStorage.setItem(SESSION_NOTICE_KEY, JSON.stringify({ severity, detail })); } catch { /* Cookies still secure the account. */ }
  window.location.replace("/user#profile");
}

export default function ConfirmProfileChange() {
  const token = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const supplied = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!/^[A-Za-z0-9_-]{43}$/.test(supplied || "")) {
      returnToProfile("error", "This confirmation link is invalid. Please request a new change from your profile.");
      return;
    }
    token.current = supplied;
    setReady(true);
  }, []);
  const confirm = async () => {
    if (!token.current || submitting.current) return;
    submitting.current = true; setBusy(true);
    try {
      const response = await browserFetch("/api/security/profile-change/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationToken: token.current }), signal: AbortSignal.timeout(60000),
      });
      const result = await response.json();
      token.current = null;
      if (!response.ok) returnToProfile("error", result.message || "The change could not be confirmed. Please request a new link from your profile.");
      else {
        if (result.state === "complete") announceSessionChange();
        returnToProfile(result.state === "complete" ? "success" : "info", result.message);
      }
    } catch {
      returnToProfile("error", "We could not verify the confirmation result. Check your profile or request a new confirmation link.");
    }
  };
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className="container ptb--120">
      <h1>Confirm your profile change</h1>
      <p>Continue only if you requested a change to your BGSNL email or password.</p>
      <p>Your account will change only after all required email confirmations are complete. You will then return to your profile.</p>
      <button type="button" className="rn-button-style--2 rn-btn-reverse-green" disabled={!ready || busy} aria-busy={busy} onClick={confirm}>
        {busy ? "Confirming…" : "Confirm change"}
      </button>
      <a className="rn-button-style--2 rn-btn-reverse-red ml--20" href="/user#profile">Cancel</a>
    </main>
  </>;
}
