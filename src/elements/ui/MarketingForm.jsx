import React from "react";
import * as yup from "yup";
import { Formik, Form, Field } from "formik";

const schema = yup.object().shape({
    university: yup.string(),
    stage: yup.string(),
    course: yup.string(),
    age: yup.string(),
    gender: yup.string(),
});

const MarketingForm = ({ setMarketingData }) => {
    return (<Formik
        className="inner"
        validationSchema={schema}
        onSubmit={(values) => {
            setMarketingData(values)
        }}
        initialValues={{
            university: '',
            stage: '',
            course: '',
            age: '',
            gender: '',
        }}
    >
        {() => (
            <Form
                id="form"
                style={{ padding: "2%" }}
            >
                <div className="row container team_member_border-1 mt--40">
                    <h3 className="center_text">
                        Please fill the form for marketing purposes
                    </h3>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <Field as="select" name="university">
                                <option value="" disabled>
                                    Select your university
                                </option>
                                <option value="BUas">Buas</option>
                                <option value="Avans">Avans</option>
                                <option value="Graduated">Graduated</option>
                                <option value="working">Working</option>
                            </Field>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <Field as="select" name="stage">
                                <option value="" disabled>
                                    Select your stage
                                </option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </Field>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <Field as="select" name="course">
                                <option value="" disabled>
                                    Select your course
                                </option>
                                <option value="RUG">Bachelors</option>
                                <option value="Hanze">Masters</option>
                                <option value="other">Other</option>
                            </Field>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <Field type='text' name="age" placeholder='Age'>

                            </Field>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <Field as="select" name="gender">
                                <option value="" disabled>
                                    Select your gender
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="other">Other</option>
                                <option value="None">Prefer not to say</option>
                            </Field>
                        </div>
                    </div>
                </div>
            </Form>
        )}
    </Formik>
    )
}

export default MarketingForm