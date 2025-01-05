import React from "react";
import { Field, ErrorMessage } from "formik";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGIONS } from "../../../util/defines/REGIONS_DESIGN";

const BasicInfo = ({ values, setFieldValue, edit }) => {
  return (
    <div>
      <h3 className="label">Basic Information</h3>
      <div className="row">
        <div className="col-lg-6 col-md-12 col-12">
          <div className="rn-form-group">
            <Field disabled={edit} as="select" name="region">
              <option value="" disabled>
                Select Region
              </option>
              {REGIONS.map((val, index) => (
                <option value={val} key={index}>
                  {capitalizeFirstLetter(val)}
                </option>
              ))}
            </Field>
            <ErrorMessage className="error" name="region" component="div" />
          </div>
        </div>
        <div className="col-lg-6 col-md-12 col-12">
          <Field
            type="text"
            placeholder="Location of event"
            name="location"
            className="rn-input"
          />
          <ErrorMessage className="error" name="location" component="div" />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-md-12 col-12">
          <div className="rn-form-group">
            <Field
              type="text"
              placeholder="Event Name"
              name="title"
              className="rn-input"
            />
            <ErrorMessage className="error" name="title" component="div" />
          </div>
        </div>
        <div className="col-lg-6 col-md-12 col-12">
          <div className="rn-form-group">
            <Field
              type="text"
              placeholder="Sub-Title"
              name="description"
              className="rn-input"
            />
            <ErrorMessage className="error" name="description" component="div" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-12">
          <CalendarWithClock
            mode="single"
            locale="en-nl"
            placeholder="Date and Time"
            captionLayout="dropdown"
            initialValue={values.date}
            min={new Date()}
            onSelect={(value) => {
              setFieldValue("date", value);
            }}
          />
          <ErrorMessage className="error" name="date" component="div" />
        </div>
      </div>
      <div className="row mt--20">
        <div className="col-lg-12 col-md-12 col-12">
          <Field
            as="textarea"
            placeholder="Full Description"
            name="text"
            rows={6}
            className="rn-input"
          />
          <ErrorMessage className="error" name="text" component="div" />
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
