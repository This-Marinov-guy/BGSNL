import {
  ErrorMessage,
  Field,
} from "formik";
import PropTypes from "prop-types";
import { Tooltip } from "@/compat/primereact";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
import { END_TIMER } from "../../util/defines/enum";
import { toCamelCase } from "../../util/functions/helpers";
import { CalendarWithClock } from "./common/Calendar";

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
  const timerName =
    timerType === END_TIMER
      ? `${prefix}.ticketTimer`
      : `${prefix}.startTimer`;
  const limitChoiceName = `${prefix}.at-least-one-limit`;

  return (
    <>
      <Tooltip target=".ticket-limit-info" />
      {withLimit && (
        <div className="row">
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
        </div>
      )}

      <div
        className="row"
        {...(withLimit
          ? {
              "data-custom-validation-field": true,
              "data-field-name": limitChoiceName,
            }
          : {})}
      >
        {withLimit && (
          <div className="col-lg-6 col-12">
            <div
              className="rn-form-group"
              data-custom-validation-field
              data-field-name={`${prefix}.ticketLimit`}
            >
              <div style={{ position: "relative" }}>
                <Field
                  type="number"
                  placeholder="Ticket Limit"
                  name={`${prefix}.ticketLimit`}
                  min={1}
                  step={1}
                  style={{ paddingRight: "35px" }}
                />
                <FiInfo
                  className="ticket-limit-info"
                  data-pr-tooltip="The count to reach in order to start these prices (can exclude members from the count if the checkbox above is checked)"
                  data-pr-position="top"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "help",
                    color: "#666",
                  }}
                />
              </div>
              <ErrorMessage
                className="error"
                name={`${prefix}.ticketLimit`}
                component="div"
                data-validation-message-for={`${prefix}.ticketLimit`}
              />
            </div>
          </div>
        )}
        <div className={withLimit ? "col-lg-6 col-12" : "col-12"}>
          <div
            className="rn-form-group"
            data-custom-validation-field
            data-field-name={timerName}
          >
            <CalendarWithClock
              mode="single"
              locale="en-nl"
              placeholder={
                timerType === END_TIMER ? "Ticket Timer" : "Start from"
              }
              captionLayout="dropdown"
              min={new Date()}
              initialValue={initialCalendarValue}
              name={timerName}
              onSelect={(value) => {
                setFieldValue(timerName, value);
              }}
            />
            {!withLimit && (
              <ErrorMessage
                className="error"
                name={timerName}
                component="div"
                data-validation-message-for={timerName}
              />
            )}
          </div>
        </div>
        {withLimit && (
          <div className="col-12">
            <ErrorMessage
              className="error center_text"
              name={limitChoiceName}
              component="div"
              data-validation-message-for={limitChoiceName}
            />
          </div>
        )}
      </div>

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

AdditionalPrices.propTypes = {
  initialCalendarValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]),
  label: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  timerType: PropTypes.number,
  visible: PropTypes.bool,
  withLimit: PropTypes.bool,
};

export default AdditionalPrices;
