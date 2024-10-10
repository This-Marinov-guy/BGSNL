import React from "react";
import { Field, ErrorMessage } from "formik";
import { FloatLabel } from "primereact/floatlabel";

const FieldExtended = (props) => {
  const {placeholder, className, ...rest} = props;

  return (
    <div className={`${className} rn-form-group`}>
      <FloatLabel>
        <Field {...rest}>{rest.children}</Field>
        <label htmlFor={rest.name}>{placeholder}</label>
      </FloatLabel>
      <ErrorMessage className="error" name={rest.name} component="div" />
    </div>
  );
};

FieldExtended.defaultProps = {
  className: "col-lg-6 col-md-12 col-12",
  name: "",
  placeholder: "",
  children: null,
};

export default FieldExtended;
