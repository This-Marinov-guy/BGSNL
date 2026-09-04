import {
  ErrorMessage,
  Field,
} from "formik";
import { toCamelCase } from "../../util/functions/helpers";
import { CalendarWithClock } from "./common/Calendar";

const PromotionalPrices = ({
  parent,
  label,
  visible = true,
  initialStartValue,
  initialEndValue,
  setFieldValue,
}) => {
  if (!visible) {
    return null;
  }

  const prefix = toCamelCase(label);

  return (
    <>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <Field
              type="number"
              placeholder={label ? `${label} Discount %` : "Discount %"}
              name={`${parent ?? ""}${prefix}.discount`}
              min={5}
              max={95}
              step="1"
            />
            <ErrorMessage
              className="error"
              name={`${parent ?? ""}${prefix}.discount`}
              component="div"
            />
            <small>
              Please write a percentage (of the current full price) of the
              desired discount
            </small>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <div data-field-name={`${parent ?? ""}${prefix}.startTimer`}>
              <CalendarWithClock
                name={`${parent ?? ""}${prefix}.startTimer`}
                mode="single"
                locale="en-nl"
                placeholder={"Start From"}
                captionLayout="dropdown"
                initialValue={initialStartValue}
                onSelect={(value) => {
                  setFieldValue(`${parent ?? ""}${prefix}.startTimer`, value);
                }}
              />
            </div>
            <ErrorMessage
              className="error"
              name={`${parent ?? ""}${prefix}.startTimer`}
              component="div"
            />
          </div>
        </div>
        <div className="col-lg-6 col-12">
          <div className="rn-form-group">
            <div data-field-name={`${parent ?? ""}${prefix}.endTimer`}>
              <CalendarWithClock
                name={`${parent ?? ""}${prefix}.endTimer`}
                mode="single"
                locale="en-nl"
                placeholder={"End At"}
                captionLayout="dropdown"
                initialValue={initialEndValue}
                onSelect={(value) => {
                  setFieldValue(`${parent ?? ""}${prefix}.endTimer`, value);
                }}
              />
            </div>
            <ErrorMessage
              className="error"
              name={`${parent ?? ""}${prefix}.endTimer`}
              component="div"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionalPrices;
