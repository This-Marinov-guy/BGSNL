"use client";

import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import { BILLING_LOCKED_STATUSES, BILLING_LOCK_EXEMPT, SUPPORT_ACCESS } from "@/util/defines/common";
import { supportRequest } from "./support-api";
import { watchSupportLive } from "./support-live.mjs";
import { supportScope } from "./support-state.mjs";
import { useSupportUnread } from "./use-support-unread";
import { supportUnreadMessageCount } from "./support-unread.mjs";

const SupportTicketAttentionContext = createContext({ hasUnanswered: false, unreadCount: 0 });

export const useSupportTicketAttention = () => useContext(SupportTicketAttentionContext).hasUnanswered;
export const useSupportUnreadMessageCount = () => useContext(SupportTicketAttentionContext).unreadCount;

export default function SupportTicketAttentionProvider({ children }) {
  const { authInitialized, session, roles, status } = useSelector(selectUser);
  const hasRole = access => roles?.some(role => access.includes(role));
  const eligible = authInitialized && !!session && hasRole(SUPPORT_ACCESS) &&
    (status === "active" || (BILLING_LOCKED_STATUSES.includes(status) && hasRole(BILLING_LOCK_EXEMPT)));
  const scope = supportScope(session);
  const { seen, ready: seenReady } = useSupportUnread(session, true);
  const [attention, setAttention] = useState({ scope: "", hasUnanswered: false, conversations: [] });

  useEffect(() => {
    if (!eligible) return undefined;
    const refresh = async signal => {
      try {
        const [unanswered, activity] = await Promise.all([
          supportRequest("inbox/unanswered", { signal }),
          supportRequest("inbox/activity", { signal }),
        ]);
        if (!signal.aborted) setAttention({ scope, hasUnanswered: unanswered.hasUnanswered === true, conversations: activity.conversations });
      } catch {
        // Keep the last confirmed result until the stream or polling reconnects.
      }
    };
    // The global unread badge only needs periodic updates. A persistent SSE
    // relay keeps a Vercel function running for the full 45-second connection.
    return watchSupportLive({ refresh, subscription: () => ({ staff: true }), stream: false });
  }, [eligible, scope]);

  const current = !!eligible && attention.scope === scope;
  return <SupportTicketAttentionContext.Provider value={{
    hasUnanswered: current && attention.hasUnanswered,
    unreadCount: current && seenReady ? supportUnreadMessageCount(attention.conversations, seen) : 0,
  }}>
    {children}
  </SupportTicketAttentionContext.Provider>;
}

SupportTicketAttentionProvider.propTypes = { children: PropTypes.node };
