"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { showNotification } from "@/redux/notification";
import { serverEndpoint } from "@/util/defines/common";
import { ACTIVE_ACCOUNT_CAMPAIGNS, requestAccountCampaign, scheduleAccountCampaign, WHATS_NEW_CAMPAIGN } from "./account-campaign.mjs";

const loadWhatsNewModal = () => import("./WhatsNewModal");
const WhatsNewModal = dynamic(loadWhatsNewModal, { ssr: false });

export default function AccountCampaignAnnouncement({ accountId, session, blocked = false, openRequest = 0 }) {
  const [open, setOpen] = useState(false);
  const [presented, setPresented] = useState(false);
  const savingRef = useRef(false);
  const stopAutomatic = useRef(null);
  const dispatch = useDispatch();
  const latest = useRef({ session, blocked });
  latest.current = { session, blocked };
  const close = useCallback(async () => {
    // Close synchronously, including a replay while an earlier save is pending.
    setOpen(false);
    stopAutomatic.current?.();
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await requestAccountCampaign({ endpoint: serverEndpoint, campaign: WHATS_NEW_CAMPAIGN, markSeen: true });
    } catch {
      dispatch(showNotification({ severity: "error", detail: "The update is closed, but we couldn’t save your preference. It may appear again on your next visit." }));
    } finally {
      savingRef.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (!openRequest) return;
    stopAutomatic.current?.();
    setPresented(true);
    setOpen(true);
  }, [openRequest]);

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
        // Recheck after loading, but only persist when the user dismisses it.
        const result = await request(false, signal);
        return { shouldShow: !result.seen };
      },
      canPresent: () => !latest.current.blocked && document.visibilityState === "visible" &&
        Date.now() - lastInteraction >= 1500 &&
        !document.activeElement?.matches('input, textarea, select, [contenteditable="true"]') &&
        !document.querySelector('.p-overlay-mask, .modal-backdrop, [role="dialog"]:not([aria-hidden="true"]), .user-sidebar-backdrop.is-visible'),
      onShow: () => {
        setPresented(true);
        setOpen(true);
      },
    });
    stopAutomatic.current = stop;
    return () => {
      stop();
      document.removeEventListener("pointerdown", interacted);
      document.removeEventListener("keydown", interacted);
    };
  }, [accountId]);

  // Keep the shell mounted for its close animation after the first display.
  return presented ? <WhatsNewModal key={openRequest} open={open} onClose={close} /> : null;
}

AccountCampaignAnnouncement.propTypes = {
  accountId: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired,
  blocked: PropTypes.bool,
  openRequest: PropTypes.number,
};
