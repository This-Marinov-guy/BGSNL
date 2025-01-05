import React from "react";
import InputsBuilder from "../../inputs/builders/InputsBuilder";
import "./formStyles.scss";

const ExtraInputsSection = ({ values, setFieldValue }) => {
  return (
    <div className="form-wrapper">
      <h3 className="section-title">Add Extra Inputs</h3>
      <div className="form-group">
        <InputsBuilder
          onChange={(inputs) => setFieldValue("extraInputsForm", inputs)}
          initialValues={values.extraInputsForm}
          className="rn-input"
        />
      </div>
    </div>
  );
};

export default ExtraInputsSection;
