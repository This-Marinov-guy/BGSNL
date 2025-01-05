import React from "react";
import InputsBuilder from "../../inputs/builders/InputsBuilder";

const ExtraInputsSection = ({ values, setFieldValue }) => {
  return (
    <div>
      <h3 className="label mt--40">Add extra inputs by your choice</h3>
      <InputsBuilder
        onChange={(inputs) => setFieldValue("extraInputsForm", inputs)}
        initialValues={values.extraInputsForm}
      />
    </div>
  );
};

export default ExtraInputsSection;
