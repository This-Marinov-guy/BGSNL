import { execFile } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import { promisify } from "node:util";

const exec = promisify(execFile);
const regions = ["NL", "GRO", "AMS", "EIN", "RTM", "LWD", "LDHG"];
export const STRIPE_FORWARD_URL = "http://127.0.0.1:8080/api/v1/webhooks/stripe-payments?region=netherlands";

export function configureTestStripe(environment) {
  const secret = environment.STRIPE_SECRET_KEY_TEST || environment.STRIPE_NL_SECRET_KEY;
  const publishable = environment.STRIPE_PUBLISHABLE_KEY_TEST || environment.STRIPE_NL_PUBLISHABLE_KEY;
  if (!/^sk_test_[A-Za-z0-9]+$/.test(secret || "") || !/^pk_test_[A-Za-z0-9]+$/.test(publishable || "")) {
    throw new Error("Local Stripe requires test keys: configure STRIPE_SECRET_KEY_TEST and STRIPE_PUBLISHABLE_KEY_TEST (or the STRIPE_NL_* test keys) in BGSNL-API/.env.local.");
  }
  const env = { ...environment, STRIPE_SECRET_KEY_TEST: secret, STRIPE_PUBLISHABLE_KEY_TEST: publishable, STRIPE_WEBHOOK_CH_KEY: "" };
  for (const region of regions) {
    env[`STRIPE_${region}_SECRET_KEY`] = secret;
    env[`STRIPE_${region}_PUBLISHABLE_KEY`] = publishable;
    env[`STRIPE_${region}_WEBHOOK_CH_KEY`] = "";
  }
  return env;
}

export function applySigningSecret(environment, secret) {
  if (!/^whsec_[A-Za-z0-9]+$/.test(secret)) throw new Error("Invalid Stripe CLI signing secret.");
  environment.STRIPE_WEBHOOK_CH_KEY = secret;
  for (const region of regions) environment[`STRIPE_${region}_WEBHOOK_CH_KEY`] = secret;
}

export async function checkStripeCli(command, execute = exec) {
  try { await execute(command, ["version"], { timeout: 10000 }); }
  catch { throw new Error("Stripe CLI is required. Install it with `brew install stripe/stripe-cli/stripe`, or set BGSNL_STRIPE_CLI to its executable path."); }
}

const redact = (value) => value.replace(/(?:whsec_|[spr]k_(?:test|live)_)[A-Za-z0-9]+/g, "[redacted]");

// Stripe emits its signing secret on startup. Read complete lines so even a
// credential split across output chunks is never echoed to the terminal.
export function waitForStripeReady(service, { child, signal, log = console.log, timeoutMs = 30000 }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      if (error) reject(error); else resolve();
    };
    const onAbort = () => finish(new Error("Stripe listener startup cancelled."));
    const timer = setTimeout(() => finish(new Error("Stripe listener did not become ready. Check the test key and network connection.")), timeoutMs);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) { onAbort(); return; }
    for (const output of [child.stdout, child.stderr]) {
      if (!output) continue;
      const decoder = new StringDecoder("utf8");
      let pending = "";
      const line = (text) => {
        // Strip terminal color escapes before recognizing the readiness line.
        // eslint-disable-next-line no-control-regex
        const clean = text.replace(/\x1b\[[0-9;]*m/g, "");
        const secret = clean.match(/\bwhsec_[A-Za-z0-9]+\b/)?.[0];
        if (!settled && secret && /Ready!/i.test(clean)) {
          service.onSecret(secret);
          finish();
        }
        if (clean.trim()) log(`[${service.name}] ${redact(clean)}`);
      };
      output.on("data", (chunk) => {
        pending += decoder.write(chunk);
        const lines = pending.split(/\r?\n/);
        pending = lines.pop();
        for (const text of lines) line(text);
        if (pending.length > 65536) {
          pending = "";
          finish(new Error("Unexpected oversized Stripe CLI output."));
        }
      });
      output.once("end", () => { line(pending + decoder.end()); });
    }
    child.once("exit", () => finish(new Error("Stripe listener exited before it was ready.")));
    child.once("error", () => finish(new Error("Could not start Stripe listener.")));
  });
}

export function stripeService(api, inherited = process.env) {
  return {
    name: "stripe-webhooks", cwd: api.cwd,
    command: inherited.BGSNL_STRIPE_CLI || "stripe",
    args: ["listen", "--forward-to", STRIPE_FORWARD_URL, "--color", "off", "--device-name", "bgsnl-local"],
    // Use the environment, not command-line arguments or the CLI's saved login.
    env: { ...inherited, STRIPE_API_KEY: api.env.STRIPE_NL_SECRET_KEY },
    ready: waitForStripeReady,
    onSecret: (secret) => applySigningSecret(api.env, secret),
  };
}
