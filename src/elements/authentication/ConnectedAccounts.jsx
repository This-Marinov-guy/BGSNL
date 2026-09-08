"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Password } from "@/compat/primereact";
import { FaGoogle } from "@/elements/ui/icons/IconlyIcons";
import { selectUser, refreshToken } from "@/redux/user";
import { showNotification } from "@/redux/notification";
import GoogleCredentialButton from "./GoogleCredentialButton";
import { createBrowserProof, googleAuthRequest } from "./google-api";
import styles from "./google-auth.module.scss";

const primary = "rn-button-style--2 rn-btn-reverse-green rn-btn-small";
const danger = "rn-button-style--2 rn-btn-reverse-red rn-btn-small";

export default function ConnectedAccounts() {
  const { token } = useSelector(selectUser);
  const dispatch = useDispatch();
  const id = useId();
  const [google, setGoogle] = useState(null);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let active = true;
    googleAuthRequest("connected-accounts", undefined, token).then((response) => {
      if (active) { setGoogle(response.google); setError(""); }
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [token, attempt]);

  const finish = (response, message) => {
    setGoogle(response.google); setEditing(false); setChallenge(null); setPassword(""); setError("");
    if (response.token) dispatch(refreshToken(response.token));
    dispatch(showNotification({ severity: "success", detail: message }));
  };
  const prepare = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      if (google.connected) {
        const response = await googleAuthRequest("google/disconnect", { password }, token);
        if (mounted.current) finish(response, "Google disconnected. Password sign-in is still available.");
      } else {
        const proof = createBrowserProof();
        const response = await googleAuthRequest("google/link/challenge", { password, proof }, token);
        if (mounted.current) { setChallenge({ ...response, proof }); setPassword(""); }
      }
    } catch (failure) { if (mounted.current) setError(failure.message); }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  };
  const complete = async (credential) => {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const response = await googleAuthRequest("google/link", { credential, challengeId: challenge.challengeId, proof: challenge.proof }, token);
      if (mounted.current) finish(response, "Google account connected.");
    } catch (failure) { if (mounted.current) { setError(failure.message); setChallenge(null); } }
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
            <p className="settings-list__description">{!google ? "Loading your connected accounts…" : google.connected ? `Connected to ${google.email}`
              : google.enabled ? "Connect Google to sign in without entering your BGSNL password. Your existing password will still work."
                : "Google sign-in has not been enabled yet. You can continue using your BGSNL password."}</p>
          </div>
          {google && <div className="settings-list__action"><button type="button" className={google.connected ? danger : primary}
            disabled={busy || editing || (!google.enabled && !google.connected)} onClick={() => { setEditing(true); setError(""); }}>
            {google.connected ? "Disconnect Google" : "Connect Google"}
          </button></div>}
        </li>
      </ul>
      {editing && <div className={styles.connectionForm}>
        <p>{google.connected ? "Confirm your password to disconnect Google. You will also be signed out on other devices; password sign-in remains available."
          : "Confirm your current BGSNL password, then choose the Google account you want to connect."}</p>
        {!challenge ? <form className={styles.passwordForm} onSubmit={prepare}>
          <div className="rn-form-group"><label htmlFor={`${id}-password`}>Current BGSNL password</label>
            <Password id={`${id}-password`} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password"
              inputClassName="bgsnl-form-control" toggleMask feedback={false} unstyled required disabled={busy} />
          </div>
          <button type="submit" className={google.connected ? danger : primary} disabled={busy || !password}>
            {busy ? "Please wait…" : google.connected ? "Confirm disconnect" : "Continue"}
          </button>
        </form> : <GoogleCredentialButton challenge={challenge} busy={busy} onCredential={complete}
          onError={(message) => { setChallenge(null); setError(message); }} />}
        <button type="button" className={primary} disabled={busy} onClick={() => { setEditing(false); setChallenge(null); setPassword(""); setError(""); }}>Cancel</button>
      </div>}
      {error && <div className={styles.error} role="alert"><p>{error}</p>
        {!google && <button type="button" className={primary} onClick={() => setAttempt((value) => value + 1)}>Try again</button>}
      </div>}
    </section>
  );
}
