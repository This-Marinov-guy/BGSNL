"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import { needsBillingAttention } from "./account-status-notice.mjs";

const BillingAttentionContext = createContext(null);
export const useBillingAttention = () => useContext(BillingAttentionContext);
const UNAVAILABLE = {
  reason: "unavailable", title: "We could not check your membership",
  description: "Billing information is temporarily unavailable. This does not mean your payment failed or that your membership is missing. Try again shortly, or contact support.",
};

export default function BillingAttentionProvider({ user, children }) {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const operation = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const required = needsBillingAttention(user);
  const key = JSON.stringify([user?._id || user?.id, user?.status, user?.subscription?.id,
    user?.subscription?.status, user?.subscription?.syncedAt, user?.lockReason, user?.billingLocked, user?.billingVerificationUnavailable, attempt]);

  useEffect(() => {
    if (!required) return undefined;
    let active = true;
    if (operation.current?.key !== key) {
      const promise = (async () => {
        let timer;
        try {
          const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), 15000); });
          const response = await Promise.race([request.current("payment/subscription/billing-details", "GET", null, {}, false, false), timeout]);
          return response?.billing?.reason ? response.billing : UNAVAILABLE;
        } catch { return UNAVAILABLE; }
        finally { clearTimeout(timer); }
      })();
      operation.current = { key, promise };
    }
    operation.current.promise.then((notice) => { if (active) setResult({ key, notice }); });
    return () => { active = false; };
  }, [key, required]);

  const loading = required && result?.key !== key;
  return <BillingAttentionContext.Provider value={{ loading, notice: required && !loading ? result.notice : null,
    retry: () => setAttempt((value) => value + 1) }}>
    {children}
  </BillingAttentionContext.Provider>;
}
BillingAttentionProvider.propTypes = { user: PropTypes.object, children: PropTypes.node };
