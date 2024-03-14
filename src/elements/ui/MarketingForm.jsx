import React, { useState } from "react";

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
                <div className="row container team_member_border-3 mt--40">
                    <h3 className="center_text">
                        Please fill the form for marketing purposes
                    </h3>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <select name="university" value={formData.university} onChange={handleChange}>
                                <option value="" disabled>Select your university</option>
                                <option value="BUas">Buas</option>
                                <option value="Avans">Avans</option>
                                <option value="Graduated">Graduated</option>
                                <option value="working">Working</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <select name="stage" value={formData.stage} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your stage
                                </option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4+">4 or further</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12">
                        <div className="rn-form-group">
                            <select name="course" value={formData.course} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your course
                                </option>
                                <option value="RUG">Bachelors</option>
                                <option value="Hanze">Masters</option>
                                <option value="other">Other</option>
                            </select>
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
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="" disabled>
                                    Select your gender
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="other">Other</option>
                                <option value="None">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MarketingForm;
