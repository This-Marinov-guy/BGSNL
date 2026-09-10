"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { serverEndpoint } from "@/util/defines/common";
import { ACTIVE_ACCOUNT_CAMPAIGNS, requestAccountCampaign, scheduleAccountCampaign, WHATS_NEW_CAMPAIGN } from "./account-campaign.mjs";

const loadWhatsNewModal = () => import("./WhatsNewModal");
const WhatsNewModal = dynamic(loadWhatsNewModal, { ssr: false });

export default function AccountCampaignAnnouncement({ accountId, session, blocked = false }) {
  const [open, setOpen] = useState(false);
  const [presented, setPresented] = useState(false);
  const latest = useRef({ session, blocked });
  latest.current = { session, blocked };
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!accountId || !latest.current.session) return undefined;
    let lastInteraction = 0;
    const interacted = () => { lastInteraction = Date.now(); };
    document.addEventListener("pointerdown", interacted, { passive: true });
    document.addEventListener("keydown", interacted);
    const request = (markSeen, signal) => requestAccountCampaign({
      endpoint: serverEndpoint, session: latest.current.session,
      campaign: WHATS_NEW_CAMPAIGN, markSeen, signal,
    });
    const stop = scheduleAccountCampaign({
      enabled: ACTIVE_ACCOUNT_CAMPAIGNS.includes(WHATS_NEW_CAMPAIGN),
      check: (signal) => request(false, signal),
      claim: async (signal) => {
        // A failed chunk download must not consume the announcement flag.
        await loadWhatsNewModal();
        if (signal.aborted) throw new Error("Announcement cancelled");
        return request(true, signal);
      },
      canPresent: () => !latest.current.blocked && document.visibilityState === "visible" &&
        Date.now() - lastInteraction >= 1500 &&
        !document.activeElement?.matches('input, textarea, select, [contenteditable="true"]') &&
        !document.querySelector('.p-overlay-mask, .modal-backdrop, [role="dialog"]:not([aria-hidden="true"]), .user-sidebar-backdrop'),
      onShow: () => {
        setPresented(true);
        setOpen(true);
      },
    });
    return () => {
      stop();
      document.removeEventListener("pointerdown", interacted);
      document.removeEventListener("keydown", interacted);
    };
  }, [accountId]);

  // Keep the shell mounted for its close animation after the first display.
  return presented ? <WhatsNewModal open={open} onClose={close} /> : null;
}

AccountCampaignAnnouncement.propTypes = {
  accountId: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired,
  blocked: PropTypes.bool,
};
