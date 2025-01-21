import { isProd } from "../functions/helpers";

export const MEMBERSHIP_PRICES_IDS = {
  "6-months Member": {
    start: isProd()
      ? "price_1QOg1FAShinXgMFZ1dZiQn1P"
      : "price_1QjcIpAShinXgMFZd1Ls3Gfw",
    renewal: isProd()
      ? "price_1QOg1FAShinXgMFZ1dZiQn1P"
      : "price_1QjcIpAShinXgMFZd1Ls3Gfw",
  },
  "12-months Member": {
    start: isProd()
      ? "price_1QOg1XAShinXgMFZyH0F4P9i"
      : "price_1QjcJNAShinXgMFZA52Zaw8w",
    renewal: isProd()
      ? "price_1QOg1XAShinXgMFZyH0F4P9i"
      : "price_1QjcJNAShinXgMFZA52Zaw8w",
  },
};