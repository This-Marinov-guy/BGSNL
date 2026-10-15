const enabled = value => value === true || value === "true";
const lower = (next, previous) => next !== "" && next != null && Number.isFinite(Number(next)) && Number(next) >= 0 && Number(next) < Number(previous);
const money = value => new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(Number(value));
const codeName = value => String(value || "").replace(/\s/g, "").toUpperCase();

export function eventPromotionChanges(previous, values) {
  if (!previous || previous.status === "draft" || enabled(values.isTicketLink)) return [];
  const changes = [];
  if (enabled(values.isFree) && !enabled(previous.isFree)) changes.push("Free admission added");
  if (enabled(values.isMemberFree) && !enabled(previous.isMemberFree)) changes.push("Free member tickets added");
  for (const [tier, label] of [["guest", "Guest"], ["member", "Member"], ["activeMember", "Active member"]]) {
    const oldPrice = previous.product?.[tier]?.price;
    const nextPrice = values[`${tier}Price`];
    if (lower(nextPrice, oldPrice)) changes.push(`${label} ticket price reduced from ${money(oldPrice)} to ${money(nextPrice)}`);
  }
  for (const [tier, label] of [["guest", "Guest"], ["member", "Member"]]) {
    const next = values[`${tier}Promotion`];
    const old = previous.promotion?.[tier];
    if (enabled(next?.isEnabled) && Number(next.discount) > 0 &&
      (!enabled(old?.isEnabled) || Number(next.discount) > Number(old.discount))) {
      changes.push(`${label} promotion: ${Number(next.discount)}% off`);
    }
  }
  for (const [key, label] of [["earlyBird", "Early bird"], ["lateBird", "Late bird"]]) {
    const next = values[key];
    const old = previous[key];
    const newlyDiscountedLateBird = key === "lateBird" && !enabled(old?.isEnabled) &&
      (lower(next?.price, values.guestPrice ?? previous.product?.guest?.price) ||
        lower(next?.memberPrice, values.memberPrice ?? previous.product?.member?.price));
    if (enabled(next?.isEnabled) && (key === "earlyBird" && !enabled(old?.isEnabled) ||
      newlyDiscountedLateBird || lower(next.price, old?.price) || lower(next.memberPrice, old?.memberPrice))) {
      changes.push(`${label} ticket offer ${enabled(old?.isEnabled) ? "improved" : "added"}`);
    }
  }
  if (enabled(values.promoCodes?.isEnabled)) {
    const oldCodes = previous.product?.promoCodes || previous.promoCodes?.codes || [];
    for (const code of values.promoCodes.codes || []) {
      if (!codeName(code.code) || code.active === false || code.active === "false" || !(Number(code.discount) > 0)) continue;
      const old = oldCodes.find(item => codeName(item.code) === codeName(code.code));
      if (!old || old.active === false || old.active === "false" ||
        (Number(old.discountType) === Number(code.discountType) && Number(code.discount) > Number(old.discount))) {
        changes.push(`Promo code ${codeName(code.code)} ${old ? "improved" : "added"}`);
      }
    }
  }
  return changes;
}

export const hasEventPromotionImprovement = (previous, values) => eventPromotionChanges(previous, values).length > 0;
