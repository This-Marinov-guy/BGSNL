"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Password } from "@/compat/primereact";
import { FaGoogle } from "@/elements/ui/icons/IconlyIcons";
import { selectUser, refreshSession } from "@/redux/user";
import { announceSessionChange } from "@/util/auth/browser-session.mjs";
import { showNotification } from "@/redux/notification";
import GoogleCredentialButton from "./GoogleCredentialButton";
import GoogleButton from "./GoogleButton";
import PasskeySettings from "./PasskeySettings";
import { createBrowserProof, googleAuthRequest } from "./google-api";
import styles from "./google-auth.module.scss";

const primary = "rn-button-style--2 rn-btn-reverse-green rn-btn-small";
const danger = "rn-button-style--2 rn-btn-reverse-red rn-btn-small";

export default function ConnectedAccounts() {
  const { session } = useSelector(selectUser);
  const dispatch = useDispatch();
  const id = useId();
  const [google, setGoogle] = useState(null);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(false);
  const statusRetryRequested = useRef(false);

  const notifyError = useCallback((message) => {
    dispatch(showNotification({
      severity: "error",
      detail: message || "Google sign-in could not be completed. Please try again.",
    }));
  }, [dispatch]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const interactive = statusRetryRequested.current;
    statusRetryRequested.current = false;
    setLoadFailed(false);
    setGoogle(null); setEditing(false); setChallenge(null); setPassword("");
    googleAuthRequest("connected-accounts", undefined, session).then((response) => {
      if (active) setGoogle(response.google);
    }).catch((failure) => {
      if (active) {
        setLoadFailed(true);
        if (interactive) notifyError(failure?.message);
      }
    });
    return () => { active = false; };
  }, [session?.userId, session?.sessionVersion, attempt, notifyError]);

  const finish = (response, message) => {
    setGoogle(response.google); setEditing(false); setChallenge(null); setPassword("");
    if (response.session) { dispatch(refreshSession(response.session)); announceSessionChange(); }
    dispatch(showNotification({ severity: "success", detail: message }));
  };
  const prepare = async (event) => {
    event.preventDefault();
    if (submitting.current || !editing || !google || challenge) return;
    if (!google.connected && google.eligible !== true) {
      notifyError("Google connection is only available for BGSNL accounts with a Gmail address (@gmail.com).");
      return;
    }
    submitting.current = true; setBusy(true);
    try {
      if (google.connected) {
        const response = await googleAuthRequest("google/disconnect", { password }, session);
        if (mounted.current) finish(response, "Google disconnected. Password sign-in is still available.");
      } else {
        const proof = createBrowserProof();
        const response = await googleAuthRequest("google/link/challenge", { password, proof }, session);
        if (mounted.current) { setChallenge({ ...response, proof }); setPassword(""); }
      }
    } catch (failure) { if (mounted.current) notifyError(failure?.message); }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  };
  const complete = async (credential) => {
    if (submitting.current || !challenge) return;
    submitting.current = true; setBusy(true);
    try {
      const response = await googleAuthRequest("google/link", { credential, challengeId: challenge.challengeId, proof: challenge.proof }, session);
      if (mounted.current) finish(response, "Google account connected.");
    } catch (failure) { if (mounted.current) { notifyError(failure?.message); setChallenge(null); } }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  };

  return (
    <section className="settings-group" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="settings-group__title">Sign-in methods</h2>
      <ul className="settings-list">
        <li className="settings-list__item">
          <span aria-hidden="true" className="settings-list__icon"><FaGoogle /></span>
          <div className="settings-list__text">
            <h3 className="settings-list__title">Google</h3>
            <p className="settings-list__description">{!google ? loadFailed ? "You can continue using your BGSNL password." : "Loading your connected accounts…" : google.connected ? `Connected to ${google.email}`
              : google.eligible === false ? "Google connection is only available for BGSNL accounts with a Gmail address (@gmail.com). You can continue using your BGSNL password."
                : google.enabled ? `Connect Google using ${google.accountEmail}. Only the same email address can be connected. Your existing password will still work.`
                : "Google sign-in has not been enabled yet. You can continue using your BGSNL password."}</p>
          </div>
          {google && <div className="settings-list__action">
            {google.connected ? <button type="button" className={danger}
              disabled={busy || editing} onClick={() => setEditing(true)}>
              Disconnect Google
            </button> : <GoogleButton disabled={busy || editing || !google.enabled || google.eligible !== true}
              onClick={() => setEditing(true)}>
              Connect Google
            </GoogleButton>}
          </div>}
        </li>
      </ul>
      <div className={styles.connectionReveal} data-open={editing} aria-hidden={!editing} inert={!editing ? true : undefined}>
        <div className={styles.connectionRevealInner}>
          <div className={styles.connectionForm}>
            <p>{google?.connected ? "Confirm your password to disconnect Google. You will also be signed out on other devices; password sign-in remains available."
              : challenge ? `Continue in Google with ${challenge.loginHint}. If the prompt does not open, use the Google button below.`
                : `Confirm your current BGSNL password to continue automatically to Google with ${google?.accountEmail || "your account email"}. A different Google account cannot be connected.`}</p>
            <div className={styles.connectionReveal} data-open={editing && !challenge} aria-hidden={!editing || Boolean(challenge)} inert={!editing || challenge ? true : undefined}>
              <div className={styles.connectionRevealInner}>
                <form id={`${id}-password-form`} className={styles.passwordForm} onSubmit={prepare}>
                  <div className="rn-form-group"><label htmlFor={`${id}-password`}>Current BGSNL password</label>
                    <Password id={`${id}-password`} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password"
                      inputClassName="bgsnl-form-control" toggleMask feedback={false} unstyled required disabled={busy || !editing || Boolean(challenge)} />
                  </div>
                </form>
              </div>
            </div>
            <div className={styles.connectionActions}>
              {!challenge ? <button type="submit" form={`${id}-password-form`} className={google?.connected ? danger : primary} disabled={busy || !editing || !password}>
                {busy ? "Please wait…" : google?.connected ? "Confirm disconnect" : "Continue"}
              </button> : editing && <GoogleCredentialButton challenge={challenge} busy={busy} autoPrompt onCredential={complete}
                onNotice={(message) => dispatch(showNotification({ severity: "warn", detail: message }))}
                onError={(message) => { setChallenge(null); notifyError(message); }} />}
              <button type="button" className={danger} disabled={busy || !editing} onClick={() => { setEditing(false); setChallenge(null); setPassword(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
      {loadFailed && <div className={styles.connectionActions}>
        <button type="button" className={primary} onClick={() => { statusRetryRequested.current = true; setAttempt((value) => value + 1); }}>Try again</button>
      </div>}
      <PasskeySettings />
    </section>
  );
}
