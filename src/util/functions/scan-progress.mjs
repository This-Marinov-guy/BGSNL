// Visual guidance only, not distance, confidence, or admission approval.
export function estimateScanProgress({ patterns = 0, decodeAttempted = false, decoded = false } = {}) {
  if (decoded) return 100;
  if (decodeAttempted) return 80;
  return Math.min(3, Math.max(0, Math.floor(patterns))) * 20;
}
