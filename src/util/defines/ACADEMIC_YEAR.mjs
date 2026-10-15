// Calendar month is 1-based. Match the API's yearless academic-year boundary.
export const ACADEMIC_YEAR_START = Object.freeze({ month: 8, day: 15 });
export const ACADEMIC_YEAR_TIME_ZONE = "Europe/Amsterdam";

export const ACADEMIC_YEAR_START_LABEL = new Date(Date.UTC(2000, ACADEMIC_YEAR_START.month - 1,
  ACADEMIC_YEAR_START.day)).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: ACADEMIC_YEAR_TIME_ZONE });
