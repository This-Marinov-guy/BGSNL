import { isProd } from "../functions/helpers";

export const MEMBERSHIP_PRICES_IDS = {
  "6-months Member": {
    start: isProd()
      ? "price_1QOg1FAShinXgMFZ1dZiQn1P"
      : (process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_6M_PRICE_ID || "price_1QjcIpAShinXgMFZd1Ls3Gfw"),
    renewal: isProd()
      ? "price_1QOg1FAShinXgMFZ1dZiQn1P"
      : (process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_6M_PRICE_ID || "price_1QjcIpAShinXgMFZd1Ls3Gfw"),
  },
  "12-months Member": {
    start: isProd()
      ? "price_1QOg1XAShinXgMFZyH0F4P9i"
      : (process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_12M_PRICE_ID || "price_1QjcJNAShinXgMFZA52Zaw8w"),
    renewal: isProd()
      ? "price_1QOg1XAShinXgMFZyH0F4P9i"
      : (process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_12M_PRICE_ID || "price_1QjcJNAShinXgMFZA52Zaw8w"),
  },
};