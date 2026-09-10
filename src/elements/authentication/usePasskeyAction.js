"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration, WebAuthnAbortService } from "@simplewebauthn/browser";
import { serverEndpoint } from "@/util/defines/common";
import { createPasskeyFlow } from "./passkey-flow.mjs";
import { requestPasskey } from "./passkey-request.mjs";

export const passkeyRequest = (path, data, session, signal) => requestPasskey(`${serverEndpoint}security/passkeys${path ? `/${path}` : ""}`, data, session, signal);

export default function usePasskeyAction({ session, onSuccess, onError, onPendingChange }) {
  const callbacks = useRef({ onSuccess, onError, onPendingChange });
  callbacks.current = { onSuccess, onError, onPendingChange };
  const [phase, setPhase] = useState("idle");
  const [supported, setSupported] = useState(null);
  const flow = useMemo(() => createPasskeyFlow({
    request: (path, data, signal) => passkeyRequest(path, data, session, signal),
    register: startRegistration, authenticate: startAuthentication,
    cancelCeremony: () => WebAuthnAbortService.cancelCeremony(),
    createProof: () => Array.from(window.crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join(""),
    onPhase: (value) => { setPhase(value); callbacks.current.onPendingChange?.(value !== "idle"); },
    onSuccess: (result, purpose) => callbacks.current.onSuccess(result, purpose),
    onError: (error) => callbacks.current.onError(error),
  }), [session?.userId, session?.sessionVersion]);

  useEffect(() => {
    setSupported(window.isSecureContext && browserSupportsWebAuthn());
    setPhase("idle");
    return () => flow.cancel(false);
  }, [flow]);
  return { supported, phase, busy: phase !== "idle", run: flow.run, cancel: flow.cancel };
}
