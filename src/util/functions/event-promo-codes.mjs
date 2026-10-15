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
export const normalizePromoCode = (code = {}) => ({ discountType: 2, discount: "", useLimit: "", timeLimit: "", minAmount: "", active: true, ...code, code: normalizePromoCodeName(code.code), audiences: code.audiences ?? defaultPromoAudiences });
const optionalNumber = (label) => yup.number()
  .transform((value, original) => original === "" ? null : value)
  .typeError(`Enter a valid ${label.toLowerCase()}`)
  .nullable();
export const promoCodesSchema = yup.object({
  isEnabled: yup.boolean(),
  codes: yup.array().when("isEnabled", {
    is: true,
    then: () => yup.array().of(yup.object({
      code: yup.string().transform((value, original) => normalizePromoCodeName(original)).required("Enter a promo code").max(100, "Promo code must be 100 characters or fewer").matches(/^[A-Z0-9-]+$/, "Promo code can use only letters, numbers or dashes"),
      discountType: yup.number().typeError("Choose a valid discount type").required("Choose a discount type").oneOf([1, 2], "Choose a valid discount type"),
      discount: yup.number().typeError("Enter a discount").required("Enter a discount").min(0.01, "Enter an amount greater than zero").when("discountType", { is: 2, then: schema => schema.max(100, "Percentage cannot exceed 100%") }),
      useLimit: optionalNumber("maximum redemptions").integer("Maximum redemptions must be a whole number").min(1, "Allow at least one redemption"),
      timeLimit: yup.string().nullable().test("date", "Choose a valid expiration date", value => !value || Number.isFinite(new Date(value).getTime())),
      minAmount: optionalNumber("minimum order").min(0.01, "Minimum order must be greater than zero"),
      audiences: yup.array().test("valid-audiences", "Choose a valid promo code audience", values =>
        !values || values.every(value => promoAudiences.some(item => item.value === value))
      ).min(1, "Select at least one audience").required("Select at least one audience"),
      active: yup.boolean(),
    })).min(1, "Add at least one promo code").max(100, "Use no more than 100 promo codes").test("unique", "Each promo code must have a different name", function (codes) {
      const seen = new Set();
      for (let index = 0; index < (codes?.length ?? 0); index += 1) {
        const name = normalizePromoCodeName(codes[index]?.code);
        if (!name) continue;
        if (seen.has(name)) return this.createError({ path: `${this.path}[${index}].code` });
        seen.add(name);
      }
      return true;
    }),
  }),
});
export function promoCodesPayload(value) {
  return value?.isEnabled ? (value.codes ?? []).filter(code => normalizePromoCodeName(code.code)).map(code => ({ ...code, code: normalizePromoCodeName(code.code), discountType: Number(code.discountType), discount: Number(code.discount), useLimit: code.useLimit ? Number(code.useLimit) : null, minAmount: code.minAmount ? Number(code.minAmount) : null, timeLimit: code.timeLimit || null })) : [];
}
