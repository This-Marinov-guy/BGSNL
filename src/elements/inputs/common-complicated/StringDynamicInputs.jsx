import { useState } from "react";
import { ErrorMessage } from "formik";
import PropTypes from "prop-types";
import XButton from "../../ui/buttons/XButton";
import PlusButton from "../../ui/buttons/PlusButton";

const LinkedErrorMessage = ({ name }) => (
  <ErrorMessage name={name}>
    {(message) =>
      typeof message === "string" ? (
        <div className="error" data-validation-message-for={name}>
          {message}
        </div>
      ) : null
    }
  </ErrorMessage>
);

LinkedErrorMessage.propTypes = {
  name: PropTypes.string.isRequired,
};

const StringDynamicInputs = ({
  initialValues,
  max = 100,
  name,
  onChange,
  placeholder: inputPlaceholder,
}) => {
  const [inputs, setInputs] = useState(
    initialValues?.length > 0 ? initialValues : []
  );

  const updateInputs = (nextInputs) => {
    setInputs(nextInputs);
    onChange(nextInputs);
  };

  const addInput = () => {
    if (max > inputs.length) {
      updateInputs([...inputs, ""]);
    }
  };

  const removeInput = (index) => {
    // if (inputs.length === 1 && index === 0) {
    //   return
    // }

    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    updateInputs(newInputs);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    updateInputs(newInputs);
  };

  const placeholderFor = (index) => {
    if (index === 0) {
      return inputPlaceholder || "Initial value";
    }

    return "Additional field";
  };

  return (
    <div data-custom-validation-field data-field-name={name}>
      <LinkedErrorMessage name={name} />
      {inputs.map((value, index) => {
        const fieldName = `${name}[${index}]`;

        return (
          <div
            className="hor_section_nospace mt--10"
            key={fieldName}
          >
            <div
              className="rn-form-group flex-grow-1"
              data-custom-validation-field
              data-field-name={fieldName}
            >
              <input
                type="text"
                name={fieldName}
                value={value}
                placeholder={placeholderFor(index)}
                onChange={(event) =>
                  handleInputChange(index, event.target.value)
                }
              />
              <LinkedErrorMessage name={fieldName} />
            </div>
            <XButton onClick={() => removeInput(index)} />
          </div>
        );
      })}
      <PlusButton className="mt--10" onClick={addInput} />
    </div>
  );
};

StringDynamicInputs.propTypes = {
  initialValues: PropTypes.arrayOf(PropTypes.string),
  max: PropTypes.number,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default StringDynamicInputs;
