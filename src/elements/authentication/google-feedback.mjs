// Background preparation is optional: only an explicit Google interaction
// should make its errors or waiting notices visible to the user.
export function createGoogleFeedbackGate() {
  let active = false;
  return {
    begin: () => { active = true; },
    clear: () => { active = false; },
    error: (message) => {
      if (!active) return null;
      active = false;
      return { severity: "error", detail: message || "Google sign-in could not be completed. Please try again." };
    },
    notice: (message) => active ? { severity: "warn", detail: message } : null,
  };
}
