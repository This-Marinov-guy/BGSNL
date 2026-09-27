export function isTemporarySupportError(error) {
  return !error?.status || error.status >= 500 || [408, 429].includes(error.status);
}
