import React from "react";
import { Field, ErrorMessage } from "formik";

const FormExtras = () => {
    return (
        <div className="row container mt--40">
            <div className="col-lg-12 col-md-12 col-12">
                <h3>Preferences</h3>
                <div className="rnform-group">
                    <Field type='text' placeholder='Team Name' name="team">
                
                    </Field>
                    <small>*Your teammate must also have a ticket and enter the same name</small>
                    <small>*Applies only if you already have a teammate</small>
                    {/* <ErrorMessage
                        className="error"
                        name="team"
                        component="div"
                    /> */}
                </div>
            </div>
            <div className="col-lg-12 col-md-12 col-12">
                <div className="rnform-group">
                    <Field as="select" name="drink">
                        <option value="" disabled>
                            Select your drink
                        </option>
                        <option value="soft drink">soft drink</option>
                        <option value="beer">beer</option>
                        <option value="white wine">white wine</option>
                        <option value="red wine">red wine</option>
                    </Field>
                    <ErrorMessage
                        className="error"
                        name="drink"
                        component="div"
                    />
                </div>
            </div>
        </div>
    )
}

export default FormExtras