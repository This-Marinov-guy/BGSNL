// Keep Google SDK setup separate so callback, cancellation and prompt behaviour
// can be tested without contacting Google or connecting a real account.
export const GOOGLE_PROMPT_WAIT_MS = 12000;
export const GOOGLE_POPUP_GUIDANCE = "Google opens in a separate window. Allow the sign-in pop-up if your browser asks. If no window opens, use the blocked-pop-up icon in the address bar to allow pop-ups for this site, then try again.";

export function mountGoogleCredentialControl({ googleId, target, challenge, autoPrompt = false, onCredential, onError, onNotice = () => {}, onInteraction = () => {} }) {
  let active = true;
  let delivered = false;
  let noticeShown = false;
  let popupButtonClicked = false;
  let promptTimer;
  let waitingTimer;
  let expiryTimer;
  let resizeObserver;
  const expiresAt = new Date(challenge.expiresAt).getTime();
  const clearTimers = () => {
    clearTimeout(promptTimer);
    clearTimeout(waitingTimer);
    clearTimeout(expiryTimer);
  };
  const dispose = () => {
    active = false;
    clearTimers();
    resizeObserver?.disconnect();
    // Google may ignore cancellation once an account was selected. The active
    // guard still prevents any late callback from connecting after cancellation.
    if (autoPrompt) { try { googleId?.cancel?.(); } catch { /* Already closed. */ } }
    target.replaceChildren();
  };
  const fail = (message) => {
    if (!active || delivered) return;
    dispose();
    onError(message);
  };
  const notice = (message) => {
    if (!active || delivered || noticeShown) return;
    noticeShown = true;
    clearTimeout(waitingTimer);
    onNotice(message);
  };
  const watchForResponse = () => {
    if (!active || delivered) return;
    clearTimeout(waitingTimer);
    noticeShown = false;
    // FedCM may provide no display/cancellation notification. Do not falsely
    // claim the flow failed: give recovery steps while still accepting consent.
    waitingTimer = setTimeout(() => notice("Still waiting for Google. Complete your Google sign-in, or cancel and try again."), GOOGLE_PROMPT_WAIT_MS);
  };

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    fail("This Google sign-in request expired. Please start again.");
    return dispose;
  }
  if (!challenge.clientId || !challenge.nonce || (autoPrompt && !challenge.loginHint)) {
    fail("Google connection could not be prepared. Please refresh your settings and try again.");
    return dispose;
  }
  expiryTimer = setTimeout(() => fail("This Google sign-in request expired. Please start again."), expiresAt - Date.now());

  target.replaceChildren();
  try {
    googleId.initialize({
      client_id: challenge.clientId, nonce: challenge.nonce,
      ...(challenge.loginHint ? { login_hint: challenge.loginHint } : {}),
      // Use the SDK's click-triggered popup, not FedCM: browsers such as Brave
      // can expose the button but reject FedCM with NotSupportedError.
      // Keep nonce verification and explicit account selection unchanged.
      auto_select: false, button_auto_select: false, use_fedcm_for_button: false, ux_mode: "popup",
      callback: (response) => {
        if (!active || delivered) return;
        if (Date.now() >= expiresAt) {
          fail("This Google sign-in request expired. Please start again.");
          return;
        }
        if (typeof response?.credential !== "string" || !response.credential) {
          fail("Google did not return a sign-in credential. Please try again.");
          return;
        }
        delivered = true;
        clearTimers();
        onCredential(response.credential);
      },
    });
    const buttonOptions = {
      type: "standard", theme: "outline", size: "large", shape: "rectangular",
      click_listener: () => {
        if (!active || delivered) return;
        onInteraction();
        // A click is not evidence of a blocked popup. The credential-button
        // API exposes no popup-failure callback; do not guess from elapsed time.
        // Ignore any older One Tap notices once the user chooses the button.
        popupButtonClicked = true;
        clearTimeout(promptTimer);
        clearTimeout(waitingTimer);
        noticeShown = false;
      },
    };
    let lastWidth;
    const renderButton = () => {
      if (!active || delivered) return;
      // Preserve Google's returning-account photo/name when its session permits
      // personalization. Widths below 200 disable that feature in the SDK.
      const width = Math.min(400, Math.max(200, Math.floor(target.clientWidth)));
      if (width === lastWidth) return;
      lastWidth = width;
      target.replaceChildren();
      googleId.renderButton(target, { ...buttonOptions, width,
        text: "continue_with" });
    };
    renderButton();
    if (typeof ResizeObserver !== "undefined") {
      // Resize only the presentation; keep the nonce and credential callback.
      resizeObserver = new ResizeObserver(() => {
        try { renderButton(); } catch { /* Keep the current sign-in attempt. */ }
      });
      resizeObserver.observe(target);
    }
    if (autoPrompt) {
      // Deferring one tick lets React's setup/cleanup replay cancel the first
      // attempt instead of opening two prompts in development Strict Mode.
      promptTimer = setTimeout(() => {
        if (!active || delivered) return;
        watchForResponse();
        try {
          googleId.prompt((moment) => {
            if (popupButtonClicked) return;
            if (moment?.isNotDisplayed?.()) {
              notice(`Google could not open its sign-in prompt. Use the Google button to try again. ${GOOGLE_POPUP_GUIDANCE}`);
            } else if (moment?.isSkippedMoment?.()) {
              notice("Google sign-in was not completed. Use the Google button to try again, or cancel and use your BGSNL password.");
            }
          });
        } catch {
          notice(`Your browser could not open Google automatically. Use the Google button to try again. ${GOOGLE_POPUP_GUIDANCE}`);
        }
      }, 0);
    }
  } catch {
    fail("Google could not start. Check your connection and browser privacy or content-blocker settings, then try again. Your BGSNL password still works.");
  }
  return dispose;
}
