import React from "react";
import { Field, ErrorMessage } from "formik";

const FormExtras = () => {
    return (
        <div className="row container mt--40">
            <div className="col-lg-12 col-md-12 col-12">
                <h3>Preferences</h3>
                <div className="rnform-group">
                <Field as="select" name="menu">
                        <option value="" disabled>
                            Select your menu
                        </option>
                        <option value="meat">With meat</option>
                        <option value="vegetarian">Vegetarian</option>
                    
                    </Field>
                    <ErrorMessage
                        className="error"
                        name="menu"
                        component="div"
                    />
                </div>
            </div>
            <div className="col-lg-12 col-md-12 col-12">
                <div className="rnform-group">
                    <Field as="select" name="type">
                        <option value="" disabled>
                            Select your type
                        </option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                    </Field>
                    <small>*Only for vegetarians</small>
                </div>
            </div>
        </div>
    )
}

export default FormExtras