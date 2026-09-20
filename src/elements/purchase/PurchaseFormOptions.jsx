import { useId } from "react";
import { ErrorMessage } from "formik";
import PropTypes from "prop-types";
import CardInputs from "@/elements/inputs/common/CardInputs";
import FormExtras from "@/elements/ui/forms/FormExtras";

const EMPTY_OPTIONS = [];

export function PurchaseAdditionalInformation({ inputs = EMPTY_OPTIONS }) {
  const headingId = useId();
  if (!inputs.length) return null;

  return (
    <section className="purchase-form-section" aria-labelledby={headingId}>
      <header className="purchase-form-section__header">
        <div className="purchase-form-section__title-row">
          <h2 id={headingId}>Additional information</h2>
          <span className="purchase-form-section__count">
            {inputs.length} {inputs.length === 1 ? "question" : "questions"}
          </span>
        </div>
      </header>
      <FormExtras inputs={inputs} />
    </section>
  );
}

PurchaseAdditionalInformation.propTypes = {
  inputs: PropTypes.array,
};

export function PurchaseAddOns({ addOns, values = EMPTY_OPTIONS, onSelect, valueMode = "object" }) {
  const headingId = useId();
  if (!addOns?.isEnabled || !addOns.items?.length) return null;

  return (
    <section
      className="purchase-form-section purchase-form-section--addons"
      aria-labelledby={headingId}
      data-custom-validation-field
      data-field-name="addOns"
    >
      <header className="purchase-form-section__header">
        <div className="purchase-form-section__title-row">
          <h2 id={headingId}>{addOns.title || "Add-ons"}</h2>
          <div className="purchase-form-section__meta" aria-label="Selection rules">
            <span className={addOns.isMandatory ? "is-required" : ""}>
              {addOns.isMandatory ? "Required" : "Optional"}
            </span>
            <span>{addOns.multi ? "Choose multiple" : "Choose one"}</span>
          </div>
        </div>
        <p>{addOns.description || "Choose any extras you would like with your ticket."}</p>
      </header>
      <CardInputs
        multi={addOns.multi}
        items={addOns.items}
        values={values}
        valueMode={valueMode}
        onSelect={onSelect}
      />
      <ErrorMessage className="error" name="addOns" component="div" />
    </section>
  );
}

PurchaseAddOns.propTypes = {
  addOns: PropTypes.shape({
    description: PropTypes.string,
    isEnabled: PropTypes.bool,
    isMandatory: PropTypes.bool,
    items: PropTypes.array,
    multi: PropTypes.bool,
    title: PropTypes.string,
  }),
  values: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  valueMode: PropTypes.oneOf(["id", "object"]),
};
