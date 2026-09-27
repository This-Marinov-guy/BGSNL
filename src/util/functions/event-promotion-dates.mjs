import * as yup from "yup";

export const optionalPromotionDateSchema = yup.string().nullable().test(
  "optional-date",
  "Choose a valid date or leave it empty",
  value => value == null || value === "" || Number.isFinite(new Date(value).getTime()),
);
