export const SCANNER_PATH = "/user/dashboard/ticket-scanner";
export const SCANNER_RETURN_COOKIE = "bgsnl-scanner-return";
export const SCANNER_RESUME_PATH = `${SCANNER_PATH}/resume`;

export function scannerReturnPath(value) {
  if (typeof value !== "string" || value.length > 4000 ||
      (value !== SCANNER_PATH && !value.startsWith(`${SCANNER_PATH}?`))) return SCANNER_PATH;
  try {
    const url = new URL(value, "https://bulgariansociety.nl");
    if (url.origin !== "https://bulgariansociety.nl" || url.pathname !== SCANNER_PATH || url.hash) return SCANNER_PATH;
    return `${url.pathname}${url.search}`;
  } catch { return SCANNER_PATH; }
}

export function scannerPathWithSearch(searchParams) {
  const query = new URLSearchParams();
  for (const [key, values] of Object.entries(searchParams || {})) {
    for (const value of Array.isArray(values) ? values : [values]) {
      if (typeof value === "string") query.append(key, value);
    }
  }
  return scannerReturnPath(`${SCANNER_PATH}${query.size ? `?${query}` : ""}`);
}
