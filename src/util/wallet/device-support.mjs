// Wallet passes are not payment cards: ApplePaySession.canMakePayments() does
// not indicate whether a membership pass can be installed. Browsers expose no
// equivalent to native PassKit's canAddPasses or Android's Wallet availability
// API. This is a conservative browser/device hint, never an authorization check.
export function detectWalletDevice({ userAgent = "", platform = "", maxTouchPoints = 0,
  secureContext = false, topLevel = false } = {}) {
  const unsupported = (reason) => ({ provider: null, reason });
  if (!secureContext) return unsupported("insecure");
  if (!topLevel) return unsupported("embedded");
  const ipad = /iPad/i.test(userAgent) || (/Mac/i.test(platform) && maxTouchPoints > 1);
  if (ipad) return unsupported("ipad");
  const applePhone = /iPhone|iPod/i.test(userAgent);
  const mac = /Macintosh/i.test(userAgent) && maxTouchPoints <= 1;
  // Offer the native pass in any browser on Apple devices. Some browsers save
  // the .pkpass file instead of opening Wallet directly; that is not a failure.
  if (applePhone || mac) return { provider: "apple", reason: null };
  const android = userAgent.match(/Android\s+(\d+)/i);
  if (android && Number(android[1]) >= 9) {
    return { provider: "google", reason: null };
  }
  // Google's web save flow also works from desktop browsers.
  if (!android && /Windows|Linux|CrOS/i.test(userAgent)) return { provider: "google", reason: null };
  return unsupported(android ? "old_android" : "unsupported_device");
}

export function readWalletDevice() {
  if (typeof window === "undefined") return null;
  return detectWalletDevice({ userAgent: navigator.userAgent, platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints, secureContext: window.isSecureContext,
    topLevel: window.self === window.top });
}

export function walletDeviceMessage(reason) {
  if (reason === "insecure") return "Open account settings over HTTPS to add your membership card.";
  if (reason === "embedded" || reason === "in_app_browser") return "Open this page in Safari on your iPhone or in your Android browser to add your card.";
  if (reason === "use_safari") return "Open account settings in Safari to add your card to Apple Wallet.";
  if (reason === "old_android") return "Use a phone running Android 9 or later for Google Wallet.";
  return "Open account settings on your iPhone or Android phone to add your membership card.";
}

// Both checks must pass. Never show an official badge merely because a user
// agent looks compatible, or because a signing credential exists on disk.
export function availableWalletProvider(device, availability) {
  const provider = device?.provider;
  if (!["apple", "google"].includes(provider) || availability?.eligible !== true) return null;
  return availability?.providers?.[provider]?.available === true ? provider : null;
}

export function validGoogleWalletSaveUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === "https://pay.google.com" && !url.username && !url.password &&
      /^\/gp\/v\/save\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(url.pathname) && !url.search && !url.hash;
  } catch { return false; }
}
