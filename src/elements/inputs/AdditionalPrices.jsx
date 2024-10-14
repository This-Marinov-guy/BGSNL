import React from "react";
import { Field, ErrorMessage } from "formik";
import { Calendar } from "./common/Calendar";
import { toCamelCase } from "../../util/functions/helpers";

const AdditionalPrices = ({
  label,
  visible = true,
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
        <div className="col-lg-12 col-12">
          <div className="hor_section_nospace mt--10">
            <Field
              style={{ maxWidth: "30px" }}
              type="checkbox"
              name={`${prefix}["excludeMembers"]`}
            />
            <p className="information">Exclude Member Tickets from count</p>
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder="Ticket Limit"
              name={`${prefix}["ticketLimit"]`}
              min={1}
              step="0.01"
            />
            <ErrorMessage
              className="error"
              name={`${prefix}["at-least-one-limit"]`}
              component="div"
            />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Calendar
              mode="single"
              locale="en-nl"
              placeholder="Ticket Timer"
              captionLayout="dropdown"
              min={new Date()}
              initialValue={initialCalendarValue}
              onSelect={(value) => {
                setFieldValue(`${prefix}["ticketTimer"]`, value);
              }}
            />
            <ErrorMessage
              className="error"
              name={`${prefix}["at-least-one-limit"]`}
              component="div"
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder={label ? `${label} Price` : "Price"}
              name={`${prefix}["price"]`}
              min={1}
              step="0.01"
            />
            <ErrorMessage
              className="error"
              name={`${prefix}["price"]`}
              component="div"
            />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder={label ? `${label} Member Price` : "Member Price"}
              name={`${prefix}["memberPrice"]`}
              min={1}
              step="0.01"
            />
            <ErrorMessage
              className="error"
              name={`${prefix}["memberPrice"]`}
              component="div"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdditionalPrices;
