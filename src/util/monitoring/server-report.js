import "server-only";
import { isIP } from "node:net";
import { API_URL } from "../api/server";

export async function reportWebEvent(event, address) {
  const secret = process.env.BGSNL_SERVER_KEY;
  if (!secret || secret.length < 32) return false;
  const headers = { "Content-Type": "application/json", "x-bgsnl-server-key": secret, "x-bgsnl-browser-proxy": "1" };
  if (address && isIP(address)) headers["x-bgsnl-client-ip"] = address;
  try {
    const response = await fetch(`${API_URL.replace(/\/$/, "")}/v1/monitoring/web-events`, {
      method: "POST", headers, body: JSON.stringify(event), cache: "no-store", signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch { return false; }
}
