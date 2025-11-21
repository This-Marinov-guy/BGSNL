export const capitalizeFirstLetter = (string, replaceUnderscore = true) => {
  if (!string) return "";

  if (replaceUnderscore) {
    string = string
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else {
    string = string.charAt(0).toUpperCase() + string.slice(1);
  }

  return string;
};

export const capitalizeAfterSpace = (string) => {
  if (!string) return "";

  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const replaceSpaceWithNewLine = (string) => {
  if (!string) return "";

  return string.replace(/_/g, " ");
};
