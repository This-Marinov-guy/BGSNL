import React from "react";
import { Field, ErrorMessage } from "formik";
import { Calendar, CalendarWithClock } from "./common/Calendar";
import { toCamelCase } from "../../util/functions/helpers";
import { END_TIMER } from "../../util/defines/enum";

const AdditionalPrices = ({
  label,
  visible = true,
  withLimit = true,
  timerType = END_TIMER,
  initialCalendarValue,
  setFieldValue,
}) => {
  if (!visible) {
    return null;
  }

  const prefix = toCamelCase(label);
  

  return (
    <>
      <div className="row">
        {withLimit && (
          <>
            <div className="col-lg-12 col-12">
              <div className="hor_section_nospace mt--10">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name={`${prefix}.excludeMembers`}
                />
                <p className="information">Exclude Member Tickets from count</p>
              </div>
            </div>
            <div className="col-lg-6 col-12">
              <div className="rn-form-group">
                <Field
                  type="number"
                  placeholder="Ticket Limit"
                  name={`${prefix}.ticketLimit`}
                  min={1}
                  step={1}
                />
                <ErrorMessage
                  className="error"
                  name={`${prefix}.ticketLimit`}
                  component="div"
                />
              </div>
            </div>
          </>
        )}
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <CalendarWithClock
              mode="single"
              locale="en-nl"
              placeholder={
                timerType === END_TIMER ? "Ticket Timer" : "Start from"
              }
              captionLayout="dropdown"
              min={new Date()}
              initialValue={initialCalendarValue}
              name={
                timerType === END_TIMER
                  ? `${prefix}.ticketTimer`
                  : `${prefix}.startTimer`
              }
              onSelect={(value) => {
                setFieldValue(
                  timerType === END_TIMER
                    ? `${prefix}.ticketTimer`
                    : `${prefix}.startTimer`,
                  value
                );
              }}
            />
            {!withLimit && (
              <ErrorMessage
                className="error"
                name={
                  timerType === END_TIMER
                    ? `${prefix}.ticketTimer`
                    : `${prefix}.startTimer`
                }
                component="div"
              />
            )}
          </div>
        </div>
      </div>

      {withLimit && (
        <div className="row">
          <div className="col-12">
            <ErrorMessage
              className="error center_text"
              name={`${prefix}.at-least-one-limit`}
              component="div"
            />
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder={label ? `${label} Price` : "Price"}
              name={`${prefix}.price`}
              min={1}
              step="0.01"
            />
            <ErrorMessage
              className="error"
              name={`${prefix}.price`}
              component="div"
            />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder={label ? `${label} Member Price` : "Member Price"}
              name={`${prefix}.memberPrice`}
              min={1}
              step="0.01"
            />
            <ErrorMessage
              className="error"
              name={`${prefix}.memberPrice`}
              component="div"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdditionalPrices;
