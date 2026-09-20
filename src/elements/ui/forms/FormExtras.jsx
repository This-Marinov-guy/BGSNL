import { SelectInput } from "@/compat/primereact";
import React from "react";
import { Field, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import { extraInputFieldName } from "../../../util/functions/input-helpers";

const FormExtras = ({ inputs }) => {
  return (
    <div className="purchase-extra-fields">
      {inputs.map((input, index) => {
        const name = extraInputFieldName(index);
        const inputId = `purchase-${name}`;
        const required = input.required === true || input.required === "true";
        const multiple = input.multiselect === true || input.multiselect === "true";
        const fieldMeta = required
          ? <span className="purchase-field-meta is-required" aria-label="Required">*</span>
          : <span className="purchase-field-meta">Optional</span>;

        if (input.type === "select" && multiple) {
          return (
            <fieldset
              key={name}
              className="purchase-extra-field purchase-extra-field--wide rn-form-group"
              data-custom-validation-field
              data-field-name={name}
            >
              <legend className="purchase-multiselect-legend">
                <span className="purchase-field-label">
                  <span>{input.placeholder}</span>
                  {fieldMeta}
                </span>
                <span className="purchase-field-hint">Choose all that apply.</span>
              </legend>
              <div className="purchase-choice-grid">
                {(input.options || []).map((value, optionIndex) => {
                  const optionId = `${inputId}-${optionIndex}`;
                  return (
                    <label className="purchase-choice" htmlFor={optionId} key={`${value}-${optionIndex}`}>
                      <Field id={optionId} type="checkbox" name={name} value={String(value)} />
                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
              <ErrorMessage className="error" name={name} component="div" data-validation-message-for={name} />
            </fieldset>
          );
        }

        if (input.type === "select") {
          return (
            <div key={name} className="purchase-extra-field rn-form-group" data-custom-validation-field data-field-name={name}>
              <label className="purchase-field-label" htmlFor={inputId}>
                <span>{input.placeholder}</span>
                {fieldMeta}
              </label>
              <Field as={SelectInput} id={inputId} name={name} aria-required={required}>
                <option value="">Select an option</option>
                {(input.options || []).map((value, optionIndex) => (
                  <option key={`${value}-${optionIndex}`} value={value}>{value}</option>
                ))}
              </Field>
              <ErrorMessage className="error" name={name} component="div" data-validation-message-for={name} />
            </div>
          );
        }

        if (input.type === "text") {
          return (
            <div key={name} className="purchase-extra-field rn-form-group" data-custom-validation-field data-field-name={name}>
              <label className="purchase-field-label" htmlFor={inputId}>
                <span>{input.placeholder}</span>
                {fieldMeta}
              </label>
              <Field id={inputId} type="text" name={name} placeholder="Enter your answer" aria-required={required} />
              <ErrorMessage className="error" name={name} component="div" data-validation-message-for={name} />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

FormExtras.propTypes = {
    inputs: PropTypes.arrayOf(
        PropTypes.shape({
            multiselect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
            options: PropTypes.arrayOf(
                PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            ),
            placeholder: PropTypes.string.isRequired,
            required: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default FormExtras;
