import React from "react";
import { Field, ErrorMessage } from "formik";

const FormExtras = ({ inputs }) => {
    return (
        <>
            {inputs.map((input, index) => {
                const name = `extraInput${index + 1}`;

                if (input.type === 'select') {
                    if (input.multiselect) {
                        return (
                            <div key={index} className="col-12 mt--20 rn-form-group">
                                <h4 className="mb--10">{input.placeholder} (multiple selection)</h4>
                                <div className="row">
                                    {input.options && input.options.map((val, i) => (
                                        <h5 key={i} className="col-4 center_div extra_input">
                                            <Field type="checkbox" name={name} value={val} />
                                            {val}
                                        </h5>
                                    ))}
                                </div>
                                <ErrorMessage
                                    className="error"
                                    name={name}
                                    component="div"
                                />
                            </div>
                        )
                    } else {
                        return (
                            <div key={index} className="col-12 mt--20 rn-form-group">
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
                                />
                            </div>
                        );
                    }
                }

                if (input.type === 'text') {
                    return (
                        <div key={index} className="col-12 mt--20 rn-form-group">
                            <h4>{input.placeholder}</h4>
                            <Field type="text" name={name} placeholder='Write your value' />
                            <ErrorMessage
                                className="error"
                                name={name}
                                component="div"
                            />
                        </div>
                    )
                }
            })}
        </>
    )
}

export default FormExtras;