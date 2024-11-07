import React from "react";
import { clarity } from "react-microsoft-clarity";
import Resizer from "react-image-file-resizer";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import { checkAuthorization } from "./authorization";
import { ACCESS_3, ACCESS_4, LOCAL_STORAGE_LOCATION } from "../defines/common";

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
  if (!isProd()) {
    return;
  }

  ReactGA.initialize(process.env.REACT_APP_GOOGLE_TAG);

  if (ReactGA.isInitialized) {
    console.log("Track with Google Analytics");
  }
};

export const clarityTrack = () => {
  if (!isProd()) {
    return;
  }

  clarity.init(process.env.REACT_APP_CLARITY_ID);
  clarity.consent();

  if (clarity.hasStarted()) {
    console.log("Track with Clarity");
    // clarity.identify('USER_ID', { userProperty: 'value' });
  }
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
  let encodedString = string.toLowerCase().replace(/ /g, "_");

  return encodeURIComponent(encodedString);
};

export const decodeFromURL = (url) => {
  const decodedString = url
    .replace(/_/g, " ")
    .replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });

  return decodeURIComponent(decodedString);
};

export const encryptData = (data) => {
  if (!data) {
    return "";
  }

  const stringifiedData = JSON.stringify(data);
  const encryptedData = CryptoJS.AES.encrypt(
    stringifiedData,
    process.env.REACT_APP_ENCRYPTION_KEY
  ).toString();

  return encryptedData;
};

export const decryptData = (string) => {
  if (!string) {
    return null;
  }

  let decryptedData;

  try {
    const decryptedBytes = CryptoJS.AES.decrypt(
      decodeURIComponent(string),
      process.env.REACT_APP_ENCRYPTION_KEY
    );
    decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    return null;
  }

  return decryptedData;
};

export const estimatePriceByEvent = (
  selectedEvent,
  user = {},
  blockDiscounts = false
) => {
  let price;
  const { product } = selectedEvent;

  const isMember = !!user && user.token;
  const isActiveMember = isMember && checkAuthorization(user.token, ACCESS_4);
  const isMemberDataFull = user?.name && user?.surname && user?.email;
  const includedText = isMember
    ? selectedEvent?.memberIncluding
      ? `(including ${selectedEvent.memberIncluding})`
      : ""
    : selectedEvent?.entryIncluding
    ? `(including ${selectedEvent.entryIncluding})`
    : "";

  if (selectedEvent.isFree || (isMember && selectedEvent.isMemberFree)) {
    price = "FREE";
  } else if (selectedEvent.ticketLink) {
    price = "Check ticket portal";
  } else if (isActiveMember && product?.activeMember?.price) {
    price =
      product?.activeMember.price +
      (!isNaN(product?.activeMember.price) ? " euro (extra discounted)" : " ") +
      includedText;
  } else if (
    isMember &&
    (product?.member.price || selectedEvent.isMemberFree)
  ) {
    price = selectedEvent.isMemberFree
      ? "FREE"
      : product?.member.price +
        (!isNaN(product?.member.price) ? " euro (discounted)" : " ") +
        includedText;
  } else if (product?.guest.price) {
    price =
      product?.guest.price +
      (!isNaN(product?.guest.price) ? " euro " : " ") +
      includedText;
  } else {
    price = "TBA";
  }

  if (
    !blockDiscounts &&
    isMemberDataFull &&
    selectedEvent.activeMemberPriceId &&
    selectedEvent.discountPass.length > 0 &&
    (selectedEvent.discountPass.includes(user.email) ||
      selectedEvent.discountPass.includes(user.name + " " + user.surname))
  ) {
    price =
      product?.activeMember.price +
      (!isNaN(product?.activeMember.price) ? " euro " : " ") +
      includedText;
  }

  if (
    !blockDiscounts &&
    isMemberDataFull &&
    selectedEvent.freePass.length > 0 &&
    (selectedEvent.freePass.includes(user.email) ||
      selectedEvent.freePass.includes(user.name + " " + user.surname))
  ) {
    price = "FREE";
  }

  // TODO: check this
  if (
    isMember &&
    !isActiveMember &&
    product.member?.price &&
    product.member?.discount &&
    product.member?.originalPrice
  ) {
    return (
      <span>
        <s>{product.member.originalPrice} euro</s>
        <br/>
        {product.member.price} euro
      </span>
    );
  }

  if (
    !isMember &&
    product.guest?.price &&
    product.guest?.discount &&
    product.guest?.originalPrice
  ) {
    return (
      <h4>
        <s>{product.guest.originalPrice} euro</s>
        <br />
        {product.guest.price} euro
      </h4>
    );
  }

  return price;
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

export const hasNonEmptyValues = (obj, threshold = 1) => {
  if (!obj) {
    return false
  }
  
  const trueCount = Object.values(obj).filter(
    (value) => value === true || value?.length > 0
  ).length;

  return trueCount > threshold;
};

export const getGeoLocation = () => {
  let location = localStorage.getItem(LOCAL_STORAGE_LOCATION) || '';

  if (location) {
    return location;
  }

  fetch(`https://ipinfo.io/json?token=${process.env.REACT_APP_GEO_TOKEN}`)
    .then((response) => response.json())
    .then((data) => {
      location = data.country; 
      localStorage.setItem(LOCAL_STORAGE_LOCATION, location);
      
    })
    .catch((error) => {
      console.error("Error fetching location data:", error);
    });

    return location
}
