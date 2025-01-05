import React from "react";
import { Field, ErrorMessage } from "formik";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import StringDynamicInputs from "../../inputs/common-complicated/StringDynamicInputs";
import SubEventBuilder from "../../inputs/builders/SubEventBuilder";
import "./formStyles.scss";

const AdditionalSettings = ({ values, setFieldValue }) => {
  return (
    <div className="form-wrapper">
      <h3 className="section-title">Additional Settings</h3>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="checkbox-item">
            <Field
              type="checkbox"
              name="isSaleClosed"
              className="rn-input"
            />
            <p>Close Sale of Tickets (only display event)</p>
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="checkbox-item">
            <Field
              type="checkbox"
              name="memberOnly"
              className="rn-input"
            />
            <p>Make event only purchasable by members (Still visible for non-members)</p>
            <ErrorMessage name="memberOnly" component="div" className="error" />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="checkbox-item">
            <Field
              type="checkbox"
              name="hidden"
              className="rn-input"
            />
            <p>Hide event from News section (only accessible from URL or subevent link)</p>
            <ErrorMessage name="hidden" component="div" className="error" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <Field
              type="number"
              placeholder="Ticket Limit"
              name="ticketLimit"
              min={1}
              step="0.01"
              className="rn-input"
            />
            <ErrorMessage name="ticketLimit" component="div" className="error" />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="form-group">
            <CalendarWithClock
              mode="single"
              locale="en-nl"
              placeholder="Ticket Timer"
              captionLayout="dropdown"
              min={values.date ? new Date(values.date) : new Date()}
              initialValue={values.ticketTimer}
              onSelect={(value) => {
                setFieldValue("ticketTimer", value);
              }}
              className="rn-input"
            />
            <ErrorMessage name="ticketTimer" component="div" className="error" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-12">
          <h5 className="sub-section-title">Discount Emails</h5>
          <p className="information">Extra emails for active members</p>
          <div className="form-group">
            <StringDynamicInputs
              name="discountPass"
              onChange={(inputs) => setFieldValue("discountPass", inputs)}
              initialValues={values.discountPass}
              placeholder="Add email"
            />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <h5 className="sub-section-title">Free Pass Emails</h5>
          <p className="information">Emails for those needing a free ticket</p>
          <div className="form-group">
            <StringDynamicInputs
              name="freePass"
              onChange={(inputs) => setFieldValue("freePass", inputs)}
              initialValues={values.freePass}
              placeholder="Add email"
            />
          </div>
        </div>
      </div>
      <div className="form-section">
        <h5 className="sub-section-title">Sub-Event Builder</h5>
        <SubEventBuilder
          onChange={(input) => setFieldValue("subEvent", input)}
          initialValues={values.subEvent}
        />
      </div>
    </div>
  );
};

export default AdditionalSettings;
