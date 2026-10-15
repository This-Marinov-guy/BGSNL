import React, { useId, useMemo } from "react";
import PropTypes from "prop-types";
import { Calendar } from "@/compat/primereact";
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";
import { academicYearToDate, validDayKey } from "@/util/analytics/statistics-period.mjs";

export const useStatisticsPeriod = () => {
  const [searchParams, setSearchParams] = useFilterSearchParams();
  const defaults = useMemo(() => academicYearToDate(), []);
  const from = validDayKey(searchParams.get("from")) ? searchParams.get("from") : defaults.from;
  const to = validDayKey(searchParams.get("to")) ? searchParams.get("to") : defaults.to;

  const setDate = (key, value) => setSearchParams((current) => {
    if (validDayKey(value)) current.set(key, value);
    else current.delete(key);
    current.delete("event");
    current.delete("page");
    return current;
  });

  return { searchParams, setSearchParams, from, to, setDate, invalid: from > to };
};

const calendarDay = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const StatisticsDateField = ({ label, dateKey, value, onChange }) => {
  const id = useId();
  const calendarValue = value ? new Date(`${value}T12:00:00`) : null;
  return <div className="event-analytics-date-filter__field">
    <label htmlFor={id}>{label}</label>
    <Calendar
      inputId={id}
      value={calendarValue}
      onChange={(event) => onChange(dateKey, calendarDay(event.value))}
      className="dashboard-date-input"
      dateFormat="dd-mm-yy"
      placeholder="Select date"
    />
  </div>;
};

StatisticsDateField.propTypes = {
  label: PropTypes.string.isRequired,
  dateKey: PropTypes.oneOf(["from", "to"]).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
