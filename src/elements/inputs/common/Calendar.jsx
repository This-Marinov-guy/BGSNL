import PropTypes from "prop-types";
import { Calendar as PrimeCalendar } from "@/compat/primereact";

const toValidDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const Calendar = ({ initialValue, value, onSelect, ...props }) => (
  <PrimeCalendar
    {...props}
    value={toValidDate(value ?? initialValue)}
    dateFormat="dd/mm/yy"
    onChange={(event) => onSelect(event.value)}
    showIcon
  />
);

export const CalendarWithClock = ({ initialValue, value, min, onSelect, ...props }) => (
  <PrimeCalendar
    {...props}
    value={toValidDate(value ?? initialValue)}
    minDate={toValidDate(min)}
    dateFormat="dd/mm/yy"
    hourFormat="24"
    stepMinute={5}
    onChange={(event) => onSelect(event.value)}
    showIcon
    showTime
  />
);

const calendarPropTypes = {
  initialValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number,
  ]),
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number,
  ]),
  min: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number,
  ]),
  onSelect: PropTypes.func.isRequired,
};

Calendar.propTypes = calendarPropTypes;
CalendarWithClock.propTypes = calendarPropTypes;
