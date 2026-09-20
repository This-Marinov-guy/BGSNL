import * as yup from "yup";
export const promoAudiences = [
  { value: "guest", label: "Guests" },
  { value: "member", label: "Members" },
  { value: "activeMember", label: "Active members" },
];
export const defaultPromoAudiences = promoAudiences
  .filter(({ value }) => value !== "activeMember")
  .map(({ value }) => value);
export const normalizePromoCodeName = value => typeof value === "string" ? value.replace(/\s+/g, "").toUpperCase() : "";
export const normalizePromoCode = (code = {}) => ({ code: "", discountType: 2, discount: "", useLimit: "", timeLimit: "", minAmount: "", active: true, ...code, code: normalizePromoCodeName(code.code), audiences: code.audiences ?? defaultPromoAudiences });
const optionalNumber = () => yup.number().transform((value, original) => original === "" ? null : value).nullable();
export const promoCodesSchema = yup.object({
  isEnabled: yup.boolean(),
  codes: yup.array().when("isEnabled", {
    is: true,
    then: () => yup.array().of(yup.object({
      code: yup.string().transform((value, original) => normalizePromoCodeName(original)).required("Enter a promo code").max(100).matches(/^[A-Z0-9-]+$/, "Use letters, numbers or dashes"),
      discountType: yup.number().required().oneOf([1, 2]),
      discount: yup.number().typeError("Enter a discount").required("Enter a discount").min(0.01, "Enter an amount greater than zero").when("discountType", { is: 2, then: schema => schema.max(100, "Percentage cannot exceed 100%") }),
      useLimit: optionalNumber().integer("Enter a whole number").min(1, "Allow at least one redemption"),
      timeLimit: yup.string().nullable().test("date", "Choose a valid expiration date", value => !value || Number.isFinite(new Date(value).getTime())),
      minAmount: optionalNumber().min(0.01),
      audiences: yup.array().of(yup.string().oneOf(promoAudiences.map(item => item.value))).min(1, "Select at least one audience").required("Select at least one audience"),
      active: yup.boolean(),
    })).min(1, "Add at least one promo code").max(100).test("unique", "Each promo code must have a different name", codes => !codes || new Set(codes.map(code => normalizePromoCodeName(code.code))).size === codes.length),
  }),
});
export function promoCodesPayload(value) {
  return value?.isEnabled ? (value.codes ?? []).filter(code => normalizePromoCodeName(code.code)).map(code => ({ ...code, code: normalizePromoCodeName(code.code), discountType: Number(code.discountType), discount: Number(code.discount), useLimit: code.useLimit ? Number(code.useLimit) : null, minAmount: code.minAmount ? Number(code.minAmount) : null, timeLimit: code.timeLimit || null })) : [];
}
