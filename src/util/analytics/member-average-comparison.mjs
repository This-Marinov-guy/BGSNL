export function memberAverageComparison(value, nationalValue, isNational) {
  if (value == null || !Number.isFinite(Number(value))) {
    return { label: "No data for this period", tone: "neutral" };
  }
  if (isNational) return { label: "National baseline", tone: "neutral" };
  if (nationalValue == null || !Number.isFinite(Number(nationalValue)) || Number(nationalValue) <= 0) {
    return { label: "No National baseline", tone: "neutral" };
  }

  const change = Math.round(((Number(value) - Number(nationalValue)) / Number(nationalValue)) * 100);
  if (change > 0) return { label: `+${change}% above National`, tone: "up" };
  if (change < 0) return { label: `${change}% below National`, tone: "down" };
  return { label: "0% vs National", tone: "neutral" };
}
