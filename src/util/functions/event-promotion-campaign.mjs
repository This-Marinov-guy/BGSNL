const enabled = value => value === true || value === "true";
const lower = (next, previous) => next !== "" && next != null && Number.isFinite(Number(next)) && Number(next) >= 0 && Number(next) < Number(previous);
const offerTerms = offer => JSON.stringify([Number(offer.discount), offer.startTimer ? new Date(offer.startTimer).getTime() : null,
  offer.endTimer ? new Date(offer.endTimer).getTime() : null]);
export function hasEventPromotionImprovement(previous, values) {
  if (!previous || previous.status === "draft" || enabled(values.isTicketLink)) return false;
  if (enabled(values.isFree) && !previous.isFree || enabled(values.isMemberFree) && !previous.isMemberFree) return true;
  if (["guest", "member", "activeMember"].some(tier => lower(values[`${tier}Price`], previous.product?.[tier]?.price))) return true;
  if (["guest", "member"].some(tier => {
    const next = values[`${tier}Promotion`];
    return enabled(next?.isEnabled) && Number(next.discount) > 0 && (!previous.promotion?.[tier]?.isEnabled || offerTerms(next) !== offerTerms(previous.promotion[tier]));
  })) return true;
  const bird = values.earlyBird;
  if (enabled(bird?.isEnabled) && (!previous.earlyBird?.isEnabled || lower(bird.price, previous.earlyBird.price) || lower(bird.memberPrice, previous.earlyBird.memberPrice))) return true;
  return enabled(values.promoCodes?.isEnabled) && (values.promoCodes.codes || []).some(code => code.code?.trim() && code.active !== false && code.active !== "false" &&
    !(previous.product?.promoCodes || []).some(old => old.code.replace(/\s/g, "").toUpperCase() === code.code.replace(/\s/g, "").toUpperCase() && old.active !== false));
}
