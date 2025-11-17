const checkIsWinter = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
  const day = now.getDate();

  // Winter: November 24 to February 24
  // November (month 10) from day 24 onwards
  // December (month 11) all days
  // January (month 0) all days
  // February (month 1) until day 24
  return (
    (month === 10 && day >= 24) || // Nov 24+
    month === 11 || // All of December
    month === 0 || // All of January
    (month === 1 && day <= 24) // Feb 1-24
  );
};

const checkIsChristmas = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)

  // Christmas: December 1 to December 31
  return month === 11; // December
};

export const HOLIDAYS = {
  isWinter: checkIsWinter(),
  isChristmas: checkIsChristmas(),
};
