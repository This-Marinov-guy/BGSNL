import React from "react";
import { Field, ErrorMessage } from "formik";

const FormExtras = ({ inputs }) => {
    return (
        <>
            {inputs.map((input, index) => {
                const name = `extraInput${index + 1}`;

                if (input.type === 'select') {
                    return (
                        <div key={index} className="col-12 mt--10">
                            <h4>{input.placeholder}</h4>
                            <Field as='select' name={name} className="col-12 mt--10">
                                <option value="" disabled selected>Select an option</option>
                                {input.options.map((val, i) => (
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

                if (input.type === 'text') {
                    return <div key={index} className="col-12 mt--10">
                        <h4>{input.placeholder}</h4>
                        <Field type="text" name={name} placeholder='Write your value' ></Field>
                        <ErrorMessage
                            className="error"
                            name={name}
                            component="div"
                        />
                    </div>
                }
            })}
        </>
    )
}

export default FormExtras