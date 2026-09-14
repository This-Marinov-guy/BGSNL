import { SelectInput } from "@/compat/primereact";
import React, { useState } from "react";
import PropTypes from "prop-types";

const MarketingForm = (props) => {
    const [formData, setFormData] = useState({
        university: '',
        stage: '',
        course: '',
        age: '',
        gender: '',
    });

    const handleChange = (event) => {
        setFormData((prevState) => {
            return { ...prevState, [event.target.name]: event.target.value };
        });
        props.setMarketingData(formData);
    };

    return (
        <div className="inner" style={{ padding: "2%" }}>
            <form id="form">
                <div className="row container team_member_border_1 mt--40">
                    <h3 className="center_text">
                        Please fill the form for marketing purposes
                    </h3>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <SelectInput name="university" value={formData.university} onChange={handleChange}>
                                <option value="" disabled>Select your university</option>
                                <option value="BUas">Buas</option>
                                <option value="Avans">Avans</option>
                                <option value="Graduated">Graduated</option>
                                <option value="working">Working</option>
                            </SelectInput>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <SelectInput name="stage" value={formData.stage} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your stage
                                </option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4+">4 or further</option>
                            </SelectInput>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <SelectInput name="course" value={formData.course} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your course
                                </option>
                                <option value="Bachelors">Bachelors</option>
                                <option value="Masters">Masters</option>
                                <option value="other">Other</option>
                            </SelectInput>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <input type='text' name="age" placeholder='Age' value={formData.age} onChange={handleChange}>

                            </input>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <SelectInput name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your gender
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="other">Other</option>
                                <option value="None">Prefer not to say</option>
                            </SelectInput>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

MarketingForm.propTypes = { setMarketingData: PropTypes.func.isRequired };

export default MarketingForm;
