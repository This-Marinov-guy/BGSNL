export function eventAverageComparison(value, nationalValue, isNational) {
  if (isNational) return null;
  const local = Number(value);
  const baseline = Number(nationalValue);
  if (value == null || !Number.isFinite(local)) return "No comparable event data";
  if (nationalValue == null || !Number.isFinite(baseline)) return "No national baseline";
  if (baseline === 0) return local === 0 ? "0% vs national" : "National average is zero";
  const change = Math.round(((local - baseline) / Math.abs(baseline)) * 100);
  return `${change > 0 ? "+" : ""}${change}% vs national`;
}
