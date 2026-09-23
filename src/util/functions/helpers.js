import React from "react";
import { clarity } from "react-microsoft-clarity";
import Resizer from "react-image-file-resizer";
import ReactGA from "react-ga4";
import { serverEndpoint } from "../defines/common";
import CryptoJS from "crypto-js";
import {
  ACCESS_4,
  LOCAL_STORAGE_LOCATION,
  LOCAL_STORAGE_COOKIE_CONSENT,
} from "../defines/common";
import SolidBadge from "../../elements/ui/badges/SolidBadge";
import { browserFetch } from "../auth/browser-request.mjs";

export const isProd = () => {
  return process.env.NODE_ENV === "production";
};

export const removeLogsOnProd = () => {
  if (isProd()) {
    console.error = () => {};
    console.warn = () => {};
    console.debug = () => {};
  }
};

export const gaTrack = () => {
  if (window.location.pathname === "/account/confirm") return;
  const consent = localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT);
  if (!isProd() || consent !== "1") {
    return;
  }

  ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_TAG);

  if (ReactGA.isInitialized) {
    console.log("Track with Google Analytics");
  }
};

export const clarityTrack = () => {
  if (window.location.pathname === "/account/confirm") return;
  const consent = localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT);
  if (!isProd() || consent !== "1") {
    return;
  }

  clarity.init(process.env.NEXT_PUBLIC_CLARITY_ID);
  clarity.consent();

  if (clarity.hasStarted()) {
    console.log("Track with Clarity");
    // clarity.identify('USER_ID', { userProperty: 'value' });
  }
};

// Clarity accepts a string event name. Properties are sent as its documented
// custom tags, and are deliberately limited to non-identifying UI metadata.
export const clarityEvent = (eventName, properties = {}) => {
  if (typeof window === "undefined" || typeof eventName !== "string" || !eventName) return;
  const consent = localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT);
  if (!isProd() || consent !== "1") return;

  if (!clarity.hasStarted()) clarityTrack();
  if (!clarity.hasStarted()) return;

  Object.entries(properties).forEach(([key, value]) => {
    if (typeof key === "string" && key && typeof value === "string" && value) clarity.setTag(key, value);
  });
  window.clarity("event", eventName);
};

export const askBeforeRedirect = (basedOnEnv = true) => {
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is needed for older browsers
  };

  if (basedOnEnv && isProd()) {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }
};

export const encodeForURL = (string) => {
  if (!string) {
    return "article";
  }

  return string
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";
};

export const decodeFromURL = (url) => {
  const decodedString = url
    .replace(/_/g, " ")
    .replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });

  return decodeURIComponent(decodedString);
};

export const encryptData = async (data) => {
  if (!data) {
    return "";
  }

  const stringifiedData = JSON.stringify(data);

  const result = await browserFetch(`${serverEndpoint}security/encrypt-data`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: stringifiedData }),
  });
  const response = { data: result.ok ? await result.json() : null };

  if (!Object.prototype.hasOwnProperty.call(response?.data || {}, "encryptedData")) {
    return null;
  }

  return response.data.encryptedData;
};

export const decryptData = (string) => {
  if (!string) {
    return null;
  }

  let decryptedData;

  try {
    const decryptedBytes = CryptoJS.AES.decrypt(
      decodeURIComponent(string),
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    );
    decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    return null;
  }

  return decryptedData;
};

const ticketPriceValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const ticketBuyerState = (user = {}, { blockDiscounts = false } = {}) => {
  const isMember = !blockDiscounts && !!user?.session && user?.memberDiscount === true;
  return {
    isMember,
    isActiveMember: isMember && user?.roles?.some((role) => ACCESS_4.includes(role)),
  };
};

const selectTicketTier = (product, buyerState) => {
  const activeMemberPrice = ticketPriceValue(product?.activeMember?.price);
  const memberPrice = ticketPriceValue(product?.member?.price);
  const guestPrice = ticketPriceValue(product?.guest?.price);

  if (buyerState.isActiveMember && activeMemberPrice !== null) {
    return product.activeMember;
  }

  if (buyerState.isMember && memberPrice !== null) {
    return product.member;
  }

  return guestPrice !== null ? product.guest : null;
};

export const ticketPriceAmountByEvent = (
  selectedEvent,
  user = {},
  { blockDiscounts = false } = {}
) => {
  const buyerState = ticketBuyerState(user, { blockDiscounts });
  if (selectedEvent?.isFree || (buyerState.isMember && selectedEvent?.isMemberFree)) {
    return 0;
  }

  return ticketPriceValue(
    selectTicketTier(selectedEvent?.product, buyerState)?.price
  );
};

export const estimatePriceByEvent = (
  selectedEvent,
  user = {},
  options = {
    withIncludedText: true,
    blockDiscounts: false,
    withMemberBadge: true,
  }
) => {
  const buyerState = ticketBuyerState(user, options);
  const selectedTier = selectTicketTier(selectedEvent?.product, buyerState);
  const selectedPrice = ticketPriceValue(selectedTier?.price);
  const selectedOriginalPrice = ticketPriceValue(selectedTier?.originalPrice);

  const includedText =
    options.withIncludedText &&
    (buyerState.isMember
      ? selectedEvent?.memberIncluding
        ? `(including ${selectedEvent.memberIncluding})`
        : ""
      : selectedEvent?.entryIncluding
      ? `(including ${selectedEvent.entryIncluding})`
      : "");

  if (selectedEvent.isFree || (buyerState.isMember && selectedEvent.isMemberFree)) {
    return "FREE";
  }

  if (selectedEvent.ticketLink) {
    return "Check ticket portal";
  }

  if (selectedTier && selectedPrice !== null) {
    const memberBadge = buyerState.isActiveMember ? (
      <SolidBadge color="#e5b80b" text="Extra discounted" />
    ) : buyerState.isMember ? (
      <SolidBadge color="#add8e6" text="Discounted" />
    ) : null;

    return (
      <div className="d-flex justify-center align-items-center items-center g--4">
        <span>
          {selectedOriginalPrice !== null && selectedOriginalPrice > selectedPrice && (
            <>
              <s>€{selectedTier.originalPrice}</s>
              <br />
            </>
          )}
          €{selectedTier.price} {includedText}
        </span>
        {options.withMemberBadge && memberBadge}{" "}
      </div>
    );
  }

  return "TBA";
};

export const hasAppliedTicketDiscount = (
  selectedEvent,
  user = {},
  { blockDiscounts = false } = {}
) => {
  if (!selectedEvent?.product || blockDiscounts || selectedEvent.isFree) {
    return false;
  }

  const buyerState = ticketBuyerState(user, { blockDiscounts });
  if (buyerState.isMember && selectedEvent.isMemberFree) {
    return true;
  }

  const appliedTier = selectTicketTier(selectedEvent.product, buyerState);
  const appliedPrice = ticketPriceValue(appliedTier?.price);
  const originalPrice = ticketPriceValue(appliedTier?.originalPrice);
  const discountPercent = Number(appliedTier?.discount);
  const guestPrice = ticketPriceValue(selectedEvent.product.guest?.price);

  if (appliedPrice === null) return false;
  if (Number.isFinite(discountPercent) && discountPercent > 0) return true;
  if (originalPrice !== null && originalPrice > appliedPrice) return true;

  return (
    buyerState.isMember &&
    guestPrice !== null &&
    appliedPrice < guestPrice
  );
};

export const checkObjectOfArraysEmpty = (obj) => {
  const allArrays = Object.values(obj);
  return allArrays.every((arr) => arr.length === 0);
};

export const resizeFile = (file, width = 1500, height = 485, format = "WEBP") =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      width,
      height,
      format,
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "blob"
    );
  });

export const hasOverlap = (array1, array2) => {
  const set = new Set(array2);
  for (let item of array1) {
    if (set.has(item)) return true;
  }
  return false;
};

export const removeSpaces = (input) => {
  return input.replace(/\s+/g, "");
};

export const removeSpacesAndLowercase = (str) => {
  return str.replace(/\s+/g, "").toLowerCase();
};

export const isObjectEmpty = (obj) => {
  return Object.keys(obj ?? {}).length === 0;
};

export const truncateString = (str, maxLength = 30) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "...";
  }
  return str;
};

export const toCamelCase = (str) => {
  return str
    .toLowerCase() // Convert the string to lowercase
    .split(" ") // Split the string into words by spaces
    .map(
      (word, index) =>
        index === 0
          ? word // Keep the first word in lowercase
          : word.charAt(0).toUpperCase() + word.slice(1) // Capitalize first letter of the rest
    )
    .join(""); // Join all the words back together
};

export const isPlainObject = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof File) &&
    !(value instanceof Blob) &&
    !(value instanceof Date) &&
    !Array.isArray(value)
  );
};

export const hasNonEmptyValues = (obj, threshold = 1, max = 3) => {
  if (!obj) {
    return false;
  }

  const trueCount = Object.values(obj).filter(
    (value) => value === true || value?.length > 0
  ).length;

  return trueCount > threshold && trueCount <= max;
};

export const getGeoLocation = () => {
  if (typeof window === "undefined") {
    return "nl";
  }

  let location = localStorage.getItem(LOCAL_STORAGE_LOCATION) || "";

  if (location) {
    return location;
  }

  if (!isProd()) {
    return "bg";
  }

  fetch(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_GEO_TOKEN}`)
    .then((response) => response.json())
    .then((data) => {
      location = data.country;
      localStorage.setItem(LOCAL_STORAGE_LOCATION, location);
    })
    .catch((error) => {
      console.error("Error fetching location data:", error);
    });

  return location;
};

// NOTE: use like isTodayInRange("06-01", "08-31") A.K.A mm-dd
export function isTodayInRange(start, end) {
  const today = new Date();
  const currentYear = today.getFullYear();

  // Parse the start and end dates
  const [startMonth, startDay] = start.split("-").map(Number);
  const [endMonth, endDay] = end.split("-").map(Number);

  // Create Date objects for the start and end dates
  const startDate = !isProd()
    ? new Date(currentYear, startMonth - 1, startDay)
    : new Date(); // Months are 0-based
  let endDate = new Date(currentYear, endMonth - 1, endDay);

  // If the end date is in the next year, adjust it
  if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
    endDate = new Date(currentYear + 1, endMonth - 1, endDay);
  }

  // Adjust today's date if it's in the range crossing year boundary
  const adjustedToday =
    today >= startDate
      ? today
      : new Date(currentYear + 1, today.getMonth(), today.getDate());

  // Check if today's date is within the range
  return adjustedToday >= startDate && adjustedToday <= endDate;
}

export const isMember = (user) => {
  return !!user?.session && user?.memberDiscount === true;
};

export function modifyHeading(text) {
  return text.replace(/_/g, " ");
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
