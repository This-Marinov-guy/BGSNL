"use client";

import { useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Password } from "@/compat/primereact";
import { FiLock, IconlyDelete } from "@/elements/ui/icons/IconlyIcons";
import { refreshSession, selectUser } from "@/redux/user";
import { announceSessionChange } from "@/util/auth/browser-session.mjs";
import { showNotification } from "@/redux/notification";
import usePasskeyAction, { passkeyRequest } from "./usePasskeyAction";
import { passkeyErrorNotice } from "./passkey-request.mjs";
import formStyles from "./google-auth.module.scss";
import styles from "./passkeys.module.scss";

const primary = "rn-button-style--2 rn-btn-reverse-green rn-btn-small";
const danger = "rn-button-style--2 rn-btn-reverse-red rn-btn-small";
const date = (value) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString() : null;

export default function PasskeySettings() {
  const { session } = useSelector(selectUser);
  const dispatch = useDispatch();
  const id = useId();
  const [passkeys, setPasskeys] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const close = () => { setEditing(null); setPassword(""); setName(""); };
  const { supported, phase, busy, run, cancel } = usePasskeyAction({ session,
    onError: (error) => { setPassword(""); dispatch(showNotification(passkeyErrorNotice(error))); },
    onSuccess: (result, purpose) => {
      setPasskeys(Array.isArray(result.passkeys) ? result.passkeys : null);
      close();
      if (result.session) { dispatch(refreshSession(result.session)); announceSessionChange(); }
      dispatch(showNotification({ severity: "success", detail: purpose === "remove" ? "Passkey removed. Other sessions have been signed out." : "Passkey added. You can now use it to sign in." }));
    },
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoadFailed(false); setPasskeys(null); setEditing(null); setPassword(""); setName("");
    passkeyRequest("", undefined, session, controller.signal).then((result) => {
      if (!Array.isArray(result.passkeys)) throw new Error("Invalid passkey list");
      if (!controller.signal.aborted) setPasskeys(result.passkeys);
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setLoadFailed(true);
        if (attempt > 0) dispatch(showNotification(passkeyErrorNotice(error)));
      }
    });
    return () => controller.abort();
  }, [session?.userId, session?.sessionVersion, attempt, dispatch]);

  const removing = editing?.purpose === "remove";
  const submit = (event) => {
    event.preventDefault();
    if (!editing || busy || !password || (!removing && (!supported || !name.trim()))) return;
    run({ ...editing, password, name: name.trim() });
    setPassword("");
  };

  return (
    <div className={styles.settings}>
      <ul className="settings-list">
        <li className="settings-list__item">
          <span aria-hidden="true" className="settings-list__icon"><FiLock /></span>
          <div className="settings-list__text">
            <h3 className="settings-list__title">Passkeys</h3>
            <p className="settings-list__description">Sign in with your fingerprint, face, device PIN or security key. Your BGSNL password will still work.</p>
            {supported === false && <p className="settings-list__description">Use an up-to-date browser on a secure connection to add a passkey.</p>}
          </div>
          <div className="settings-list__action">
            <button type="button" className={primary} disabled={supported !== true || busy || Boolean(editing) || !passkeys}
              onClick={() => { setEditing({ purpose: "register" }); setName(""); setPassword(""); }}>Add passkey</button>
          </div>
          <div className={styles.panelBody}>
            {!passkeys && <div className={styles.status} role="status">
              <p>{loadFailed ? "Passkeys could not be loaded. Your password is still available." : "Loading your passkeys…"}</p>
              {loadFailed && <button type="button" className={primary} onClick={() => setAttempt((value) => value + 1)}>Try again</button>}
            </div>}
            {passkeys?.length === 0 && <p className={styles.status}>No passkeys yet. Add one on a device you trust.</p>}
            {passkeys?.length > 0 && <ul className={styles.list} aria-label="Registered passkeys">
              {passkeys.map((passkey) => <li key={passkey.id} className={styles.item}>
                <div>
                  <h4>{passkey.name}</h4>
                  <p>{passkey.rpId === "localhost" ? "Local development · " : ""}{date(passkey.lastUsedAt) ? `Last used ${date(passkey.lastUsedAt)}` : `Added ${date(passkey.createdAt) || "recently"}`}</p>
                </div>
                <button type="button" className={`${danger} ${styles.remove}`} disabled={busy || Boolean(editing)}
                  aria-label={`Remove ${passkey.name}`} title={`Remove ${passkey.name}`}
                  onClick={() => { setEditing({ purpose: "remove", credentialId: passkey.id, label: passkey.name }); setPassword(""); }}>
                  <IconlyDelete size={24} aria-hidden="true" focusable="false" />
                </button>
              </li>)}
            </ul>}
            <div className={formStyles.connectionReveal} data-open={Boolean(editing)} aria-hidden={!editing} inert={!editing ? true : undefined}>
              <div className={formStyles.connectionRevealInner}>
                <div className={formStyles.connectionForm}>
                  <p>{removing ? `Confirm your password to remove “${editing.label}”. This signs out other sessions. Your password and any other passkeys will still work. Removing it here does not delete it from your device’s password manager.`
                    : "Name this passkey and confirm your current BGSNL password. Your device will then ask you to verify. Your fingerprint, face and device PIN are never sent to BGSNL."}</p>
                  <form className={formStyles.passwordForm} onSubmit={submit}>
                    {!removing && <div className="rn-form-group">
                      <label htmlFor={`${id}-name`}>Passkey name</label>
                      <input id={`${id}-name`} className="bgsnl-form-control" value={name} onChange={(event) => setName(event.target.value)}
                        placeholder="For example, my phone" maxLength={60} required autoComplete="off" disabled={!editing || busy} />
                    </div>}
                    <div className="rn-form-group">
                      <label htmlFor={`${id}-password`}>Current BGSNL password</label>
                      <Password id={`${id}-password`} inputClassName="bgsnl-form-control" value={password} onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password" required toggleMask feedback={false} unstyled disabled={!editing || busy} />
                    </div>
                    {busy && <p role="status">{phase === "device" ? "Follow the passkey prompt on your device…" : "Please wait…"}</p>}
                    <div className={formStyles.connectionActions}>
                      <button type="submit" className={removing ? danger : primary} disabled={!editing || busy || !password || (!removing && !name.trim())}>
                        {removing ? "Remove passkey" : "Continue"}
                      </button>
                      <button type="button" className={danger} disabled={!editing || phase === "verifying"}
                        onClick={() => { cancel(); close(); }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
