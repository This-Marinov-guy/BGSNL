import React from "react";
import { Field, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import { extraInputFieldName } from "../../../util/functions/input-helpers";

const FormExtras = ({ inputs }) => {
    return (
        <>
            {inputs.map((input, index) => {
                const name = extraInputFieldName(index);

                if (input.type === 'select') {
                    if (input.multiselect === true || input.multiselect === "true") {
                        return (
                            <div
                                key={index}
                                className="col-12 mt--20 rn-form-group"
                                data-custom-validation-field
                                data-field-name={name}
                            >
                                <h4 className="mb--10">{input.placeholder} (multiple selection)</h4>
                                <div className="row center_div">
                                    {input.options && input.options.map((val, i) => (
                                        <h5 key={i} className="col-lg-4 col-md-6 col-12 center_div extra_input">
                                            <Field type="checkbox" name={name} value={val} />
                                            {val}
                                        </h5>
                                    ))}
                                </div>
                                <ErrorMessage
                                    className="error"
                                    name={name}
                                    component="div"
                                    data-validation-message-for={name}
                                />
                            </div>
                        )
                    } else {
                        return (
                            <div
                                key={index}
                                className="col-12 mt--20 rn-form-group"
                                data-custom-validation-field
                                data-field-name={name}
                            >
                                <h4>{input.placeholder}</h4>
                                <Field as='select' name={name} className="col-12 mt--10">
                                    <option value="">Select an option</option>
                                    {input.options && input.options.map((val, i) => (
                                        <option key={i} value={val}>{val}</option>
                                    ))}
                                </Field>
                                <ErrorMessage
                                    className="error"
                                    name={name}
                                    component="div"
                                    data-validation-message-for={name}
                                />
                            </div>
                        );
                    }
                }

                if (input.type === 'text') {
                    return (
                        <div
                            key={index}
                            className="col-12 mt--20 rn-form-group"
                            data-custom-validation-field
                            data-field-name={name}
                        >
                            <h4>{input.placeholder}</h4>
                            <Field type="text" name={name} placeholder='Write your value' />
                            <ErrorMessage
                                className="error"
                                name={name}
                                component="div"
                                data-validation-message-for={name}
                            />
                        </div>
                    )
                }
            })}
        </>
    )
}

FormExtras.propTypes = {
    inputs: PropTypes.arrayOf(
        PropTypes.shape({
            multiselect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
            options: PropTypes.arrayOf(
                PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            ),
            placeholder: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default FormExtras;
