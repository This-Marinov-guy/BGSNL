import React from "react";
import { Field, ErrorMessage } from "formik";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import StringDynamicInputs from "../../inputs/common-complicated/StringDynamicInputs";
import SubEventBuilder from "../../inputs/builders/SubEventBuilder";

const AdditionalSettings = ({ values, setFieldValue }) => {
  return (
    <div>
      <h3 className="label mt--20">Additional Settings</h3>
      <div className="row mt--20">
        <div className="col-lg-6 col-12">
          <div className="hor_section_nospace mt--20">
            <Field
              style={{ maxWidth: "30px" }}
              type="checkbox"
              name="isSaleClosed"
            />
            <p className="information">
              Close Sale of Tickets (only display event)
            </p>
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="hor_section_nospace mt--20">
            <Field
              style={{ maxWidth: "30px" }}
              type="checkbox"
              name="memberOnly"
            />
            <p className="information">
              Make event only purchasable by members (Still visible for
              non-members)
            </p>
          </div>
          <ErrorMessage className="error" name="memberOnly" component="div" />
        </div>
        <div className="col-lg-6 col-12">
          <div className="hor_section_nospace mt--20">
            <Field
              style={{ maxWidth: "30px" }}
              type="checkbox"
              name="hidden"
            />
            <p className="information">
              Hide event from News section (only accessible from URL or subevent
              link)
            </p>
          </div>
          <ErrorMessage className="error" name="hidden" component="div" />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder="Ticket Limit"
              name="ticketLimit"
              min={1}
              step="0.01"
              className="rn-input"
            />
            <ErrorMessage className="error" name="ticketLimit" component="div" />
          </div>
        </div>
        <div className="col-lg-6 col-12">
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
          />
          <ErrorMessage className="error" name="ticketTimer" component="div" />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-12 mt--20">
          <h5>Discount emails (extra from the active members)</h5>
          <StringDynamicInputs
            name="discountPass"
            onChange={(inputs) => setFieldValue("discountPass", inputs)}
            initialValues={values.discountPass}
            placeholder="Add email"
          />
        </div>
        <div className="col-lg-6 col-12 mt--20">
          <h5>Free Pass emails (for those who need a free ticket)</h5>
          <StringDynamicInputs
            name="freePass"
            onChange={(inputs) => setFieldValue("freePass", inputs)}
            initialValues={values.freePass}
            placeholder="Add email"
          />
        </div>
      </div>
      <SubEventBuilder
        onChange={(input) => setFieldValue("subEvent", input)}
        initialValues={values.subEvent}
      />
    </div>
  );
};

export default AdditionalSettings;
