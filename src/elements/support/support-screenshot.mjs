const MAX_BYTES = 5 * 1024 * 1024;
const PRIVATE_CONTENT = '[data-private], [data-hj-suppress], [data-clarity-mask], [data-dd-privacy="mask"], [contenteditable="true"]';

export function screenshotDimensions(doc, viewport) {
  const width = Math.max(viewport.innerWidth, doc.documentElement.scrollWidth, doc.body?.scrollWidth || 0);
  const height = Math.max(viewport.innerHeight, doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0);
  return { width, height, scale: Math.min(viewport.devicePixelRatio || 1, 1.5, 2000 / width, 8192 / height, Math.sqrt(3_000_000 / (width * height))) };
}

export function prepareScreenshotClone(doc) {
  doc.documentElement.style.position = "relative";
  doc.documentElement.style.overflow = "visible";
  doc.body.style.overflow = "visible";
  // Change only the detached clone, never the customer's page or entered values.
  doc.querySelectorAll('[data-support-widget-root], [data-support-desk]').forEach((element) => element.remove());
  doc.querySelectorAll(PRIVATE_CONTENT).forEach((element) => { element.style.visibility = "hidden"; });
  doc.querySelectorAll('input, textarea, select').forEach((element) => {
    element.value = "";
    element.removeAttribute("value");
    element.removeAttribute("placeholder");
    if (element.tagName === "TEXTAREA") element.textContent = "";
    if (element.tagName === "SELECT") Array.from(element.options).forEach((option) => { option.textContent = ""; });
    if (element.type === "checkbox" || element.type === "radio") element.checked = false;
  });
}

export async function captureFullPageScreenshot({ doc = document, viewport = window, render } = {}) {
  const html2canvas = render || (await import("html2canvas")).default;
  const dimensions = screenshotDimensions(doc, viewport);
  const canvas = await html2canvas(doc.documentElement, {
    ...dimensions, backgroundColor: "#ffffff", logging: false, useCORS: true, allowTaint: false,
    imageTimeout: 5000, scrollX: 0, scrollY: 0, x: 0, y: 0,
    windowWidth: viewport.innerWidth, windowHeight: viewport.innerHeight,
    ignoreElements: (element) => element.matches('[data-support-widget-root], [data-support-desk], iframe, video'),
    onclone: prepareScreenshotClone,
  });
  try {
    let blob;
    for (const quality of [0.85, 0.65, 0.45]) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES) break;
    }
    if (!blob || blob.size > MAX_BYTES) throw new Error("The screenshot could not be prepared.");
    return new File([blob], `website-screenshot-${Date.now()}.jpg`, { type: "image/jpeg" });
  } finally { canvas.width = 0; canvas.height = 0; }
}

// Capture starts at submission, while the report itself is sent independently.
// Retain the promise with the report operation so an ambiguous retry won't recapture.
export function startReportScreenshot(capture = captureFullPageScreenshot) {
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), 15000); });
  return Promise.race([Promise.resolve().then(capture).catch(() => null), timeout]).finally(() => clearTimeout(timer));
}

export async function attachReportScreenshot({ screenshot, conversationId, messageId, session, secret }, request) {
  const file = await screenshot;
  if (!file) return false;
  const data = new FormData();
  data.append("id", messageId);
  data.append("text", "Automatic page screenshot");
  data.append("images", file);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await request(`conversations/${conversationId}/messages`, { session, secret, data });
      return true;
    } catch (error) {
      if (attempt === 1 || (error.status && error.status < 500)) return false;
      // Replay the same message ID/file after an ambiguous network/server failure.
    }
  }
  return false;
}
