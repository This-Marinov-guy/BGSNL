import { browserFetch } from "../../util/auth/browser-request.mjs";
export const WHATS_NEW_CAMPAIGN = "whats-new-2026-09";

// Uncomment a campaign when it is ready to appear on account visits.
// The local ignore-seen flag does not enable inactive campaigns.
export const ACTIVE_ACCOUNT_CAMPAIGNS = Object.freeze([
  // WHATS_NEW_CAMPAIGN,
]);

// This request deliberately bypasses page loaders, auth redirects and toasts.
// An unavailable announcement must never prevent someone using their account.
export async function requestAccountCampaign({ endpoint, campaign, markSeen = false, signal }) {
  // Local previews must neither read nor write the real account's history.
  // The development guard keeps this disabled even if the flag reaches a build.
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_WHATS_NEW_IGNORE_SEEN === "true") {
    return { campaign, ...(markSeen ? { shouldShow: true } : { seen: false }) };
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 8000);
  try {
    const response = await browserFetch(
      `${endpoint.replace(/\/$/, "")}/user/campaigns/${encodeURIComponent(campaign)}${markSeen ? "/seen" : ""}`,
      {
        method: markSeen ? "POST" : "GET",
        headers: {},
        cache: "no-store",
        signal: controller.signal,
      }
    );
    if (!response.ok) throw new Error("Announcement unavailable");
    const result = await response.json();
    if (result.campaign !== campaign || typeof result[markSeen ? "shouldShow" : "seen"] !== "boolean") {
      throw new Error("Invalid announcement response");
    }
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export function scheduleAccountCampaign({ check, claim, canPresent, onShow, delay = 1500, enabled = true }) {
  if (!enabled) return () => {};
  const controller = new AbortController();
  let timer;
  let claimed = false;
  const present = async () => {
    if (controller.signal.aborted) return;
    if (!canPresent()) {
      timer = setTimeout(present, delay);
      return;
    }
    try {
      if (!claimed) {
        const result = await claim(controller.signal);
        if (!result.shouldShow) return;
        claimed = true;
      }
      if (controller.signal.aborted) return;
      if (!canPresent()) {
        timer = setTimeout(present, delay);
        return;
      }
      onShow();
    } catch { /* Retry on a future account visit; leave the current page alone. */ }
  };
  timer = setTimeout(async () => {
    try {
      const result = await check(controller.signal);
      if (!result.seen && !controller.signal.aborted) await present();
    } catch { /* Optional background announcements fail quietly. */ }
  }, delay);
  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}
