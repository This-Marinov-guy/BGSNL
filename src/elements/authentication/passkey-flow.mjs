import { PasskeyRequestError } from "./passkey-request.mjs";

export const PASSKEY_DEVICE_TIMEOUT_MS = 70000;

// Inert until run() is called by a user. Each attempt owns its requests and
// device prompt; navigation/cancel cannot deliver a late login or token update.
export function createPasskeyFlow({ request, register, authenticate, cancelCeremony, createProof, onPhase, onSuccess, onError }) {
  let active = null;
  const cancel = (notify = true) => {
    const attempt = active;
    active = null;
    attempt?.controller.abort();
    if (attempt?.ceremony) cancelCeremony();
    if (attempt?.timer) clearTimeout(attempt.timer);
    if (notify) onPhase("idle");
  };
  const run = async ({ purpose, password, name, credentialId } = {}) => {
    if (active) return;
    const attempt = { controller: new AbortController(), ceremony: false };
    active = attempt;
    onPhase("preparing");
    const current = () => active === attempt;
    try {
      if (purpose === "remove") {
        onPhase("verifying");
        const result = await request("remove", { password, credentialId }, attempt.controller.signal);
        if (current()) onSuccess(result, purpose);
        return;
      }
      if (!["register", "login"].includes(purpose)) throw new Error("Invalid purpose");
      const proof = createProof();
      const prepared = await request(`${purpose}/options`, { proof, ...(purpose === "register" ? { password, name } : {}) }, attempt.controller.signal);
      if (!current()) return;
      if (!prepared.options?.challenge || !prepared.challengeId || !Number.isFinite(Date.parse(prepared.expiresAt)) || Date.parse(prepared.expiresAt) <= Date.now()) {
        throw new PasskeyRequestError("Your passkey request expired. Please try again.");
      }
      onPhase("device");
      attempt.ceremony = true;
      const credential = await Promise.race([
        (purpose === "register" ? register : authenticate)({ optionsJSON: prepared.options }),
        new Promise((_resolve, reject) => {
          attempt.timer = setTimeout(() => {
            cancelCeremony();
            reject(new PasskeyRequestError("Still waiting for your device. Please try again or use your BGSNL password."));
          }, PASSKEY_DEVICE_TIMEOUT_MS);
        }),
      ]);
      attempt.ceremony = false;
      clearTimeout(attempt.timer);
      if (!current()) return;
      onPhase("verifying");
      const result = await request(purpose, { credential, proof, challengeId: prepared.challengeId }, attempt.controller.signal);
      if (current()) onSuccess(result, purpose);
    } catch (error) {
      if (current()) onError(error);
    } finally {
      clearTimeout(attempt.timer);
      if (current()) { active = null; onPhase("idle"); }
    }
  };
  return { run, cancel };
}
