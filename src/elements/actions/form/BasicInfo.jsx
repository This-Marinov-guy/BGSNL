import React from "react";
import { Field, ErrorMessage } from "formik";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGIONS } from "../../../util/defines/REGIONS_DESIGN";
import "./formStyles.scss";

const BasicInfo = ({ values, setFieldValue, edit }) => {
  return (
    <div className="form-wrapper">
      <h3 className="section-title">Basic Information</h3>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <Field
              as="select"
              disabled={edit}
              name="region"
              value={values.region}
              onChange={(e) => setFieldValue("region", e.target.value)}
              className="rn-input"
            >
              <option value="" disabled>
                Select Region
              </option>
              {REGIONS.map((val, index) => (
                <option value={val} key={index}>
                  {capitalizeFirstLetter(val)}
                </option>
              ))}
            </Field>
            <ErrorMessage name="region" component="div" className="error" />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <Field
              type="text"
              placeholder="Location of event"
              name="location"
              className="rn-input"
            />
            <ErrorMessage name="location" component="div" className="error" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <Field
              type="text"
              placeholder="Event Name"
              name="title"
              className="rn-input"
            />
            <ErrorMessage name="title" component="div" className="error" />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <Field
              type="text"
              placeholder="Sub-Title"
              name="description"
              className="rn-input"
            />
            <ErrorMessage name="description" component="div" className="error" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <CalendarWithClock
              mode="single"
              locale="en-nl"
              placeholder="Date and Time"
              captionLayout="dropdown"
              initialValue={values.date}
              min={new Date()}
              onSelect={(value) => setFieldValue("date", value)}
              className="rn-input"
            />
            <ErrorMessage name="date" component="div" className="error" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <Field
              as="textarea"
              placeholder="Full Description"
              name="text"
              rows={6}
              className="rn-input"
            />
            <ErrorMessage name="text" component="div" className="error" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
