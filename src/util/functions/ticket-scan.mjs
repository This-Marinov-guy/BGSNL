export function parseTicketScan(value) {
  const raw = String(value || "").trim();
  if (/^[A-Za-z0-9_-]{22}$/.test(raw)) return { token: raw };
  let url;
  try { url = new URL(raw, "https://bulgariansociety.nl"); } catch { throw new Error("Scan a BGSNL ticket QR code."); }
  if (!["bulgariansociety.nl", "www.bulgariansociety.nl", "localhost"].includes(url.hostname) ||
    !["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("This is not a BGSNL ticket link.");
  const short = url.pathname.match(/^\/t\/([A-Za-z0-9_-]{22})$/);
  if (short) return { token: short[1] };
  if (!["/user/check-guest-list", "/user/dashboard/guest-list", "/user/dashboard/ticket-scanner"].includes(url.pathname)) throw new Error("Scan a ticket, not a membership card.");
  const token = url.searchParams.get("token");
  if (token && /^[A-Za-z0-9_-]{22}$/.test(token)) return { token };
  const eventId = url.searchParams.get("event"), code = url.searchParams.get("code");
  if (!/^[a-f\d]{24}$/i.test(eventId || "") || !/^\d{1,16}$/.test(code || "")) throw new Error("This ticket link is incomplete.");
  // Never auto-admit a group using the count embedded in an old image.
  return { eventId, code };
}
