import * as yup from "yup";
export const promoAudiences = [
  { value: "guest", label: "Guests" },
  { value: "member", label: "Members" },
  { value: "activeMember", label: "Active members" },
];
export const normalizePromoCode = (code = {}) => ({ code: "", discountType: 2, discount: "", useLimit: "", timeLimit: "", minAmount: "", active: true, ...code, audiences: code.audiences ?? promoAudiences.map(item => item.value) });
const optionalNumber = () => yup.number().transform((value, original) => original === "" ? null : value).nullable();
export const promoCodesSchema = yup.object({
  isEnabled: yup.boolean(),
  codes: yup.array().when("isEnabled", {
    is: true,
    then: () => yup.array().of(yup.object({
      code: yup.string().trim().required("Enter a promo code").max(100).matches(/^[a-z0-9-]+$/i, "Use letters, numbers or dashes"),
      discountType: yup.number().required().oneOf([1, 2]),
      discount: yup.number().typeError("Enter a discount").required("Enter a discount").min(0.01, "Enter an amount greater than zero").when("discountType", { is: 2, then: schema => schema.max(100, "Percentage cannot exceed 100%") }),
      useLimit: optionalNumber().integer("Enter a whole number").min(1, "Allow at least one redemption"),
      timeLimit: yup.string().nullable().test("date", "Choose a valid expiration date", value => !value || Number.isFinite(new Date(value).getTime())),
      minAmount: optionalNumber().min(0.01),
      audiences: yup.array().of(yup.string().oneOf(promoAudiences.map(item => item.value))).min(1, "Select at least one audience").required("Select at least one audience"),
      active: yup.boolean(),
    })).min(1, "Add at least one promo code").max(100).test("unique", "Each promo code must have a different name", codes => !codes || new Set(codes.map(code => code.code?.trim().toUpperCase())).size === codes.length),
  }),
});
export function promoCodesPayload(value) {
  return value?.isEnabled ? (value.codes ?? []).filter(code => code.code?.trim()).map(code => ({ ...code, code: code.code.trim().toUpperCase(), discountType: Number(code.discountType), discount: Number(code.discount), useLimit: code.useLimit ? Number(code.useLimit) : null, minAmount: code.minAmount ? Number(code.minAmount) : null, timeLimit: code.timeLimit || null })) : [];
}
