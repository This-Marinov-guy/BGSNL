import {
  Fragment,
  useState,
} from "react";
import { ErrorMessage } from "formik";
import PropTypes from "prop-types";
import StringDynamicInputs from "../common-complicated/StringDynamicInputs";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";

const emptyInput = () => ({
  type: "",
  placeholder: "",
  required: false,
  multiselect: false,
  options: [],
});

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

const InputsBuilder = ({ initialValues, max = 5, name, onChange }) => {
  const [inputs, setInputs] = useState(
    initialValues?.length > 0 ? initialValues : []
  );

  const updateInputs = (nextInputs) => {
    setInputs(nextInputs);
    onChange(nextInputs);
  };

  const addInput = () => {
    if (max > inputs.length) {
      updateInputs([...inputs, emptyInput()]);
    }
  };

  const removeInput = (index) => {
    // if (inputs.length === 1 && index === 0) {
    //     return
    // }

    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    updateInputs(newInputs);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index] = {
      ...newInputs[index],
      [field]: value,
    };
    updateInputs(newInputs);
  };

  return (
    <div data-custom-validation-field data-field-name={name}>
      <LinkedErrorMessage name={name} />
      {inputs.length > 0 ? (
        inputs.map((value, index) => {
          const inputPath = `${name}[${index}]`;
          const typeName = `${inputPath}.type`;
          const requiredName = `${inputPath}.required`;
          const multiselectName = `${inputPath}.multiselect`;
          const placeholderName = `${inputPath}.placeholder`;

          return (
            <Fragment key={inputPath}>
              <h3 className="mt--20">Input {index + 1}</h3>
              <div
                className="row ml--5 mt--10"
                data-custom-validation-field
                data-field-name={typeName}
              >
                <h4 className="col-lg-6 col-12">Select type of input</h4>
                <select
                  value={value.type}
                  onChange={(event) =>
                    handleInputChange(index, "type", event.target.value)
                  }
                  name={typeName}
                  className="col-7"
                >
                  <option disabled value="">
                    Choose type
                  </option>
                  <option value="text">Text</option>
                  <option value="select">Select</option>
                </select>
                <LinkedErrorMessage name={typeName} />
                <PlusButton onClick={addInput} />
                <XButton onClick={() => removeInput(index)} />
              </div>
              {value.type &&
                (value.type === "text" ? (
                  <div className="row mt--10">
                    <div
                      className="col-6"
                      data-custom-validation-field
                      data-field-name={requiredName}
                    >
                      <h4>Is it required</h4>
                      <select
                        value={value.required}
                        onChange={(event) =>
                          handleInputChange(
                            index,
                            "required",
                            event.target.value
                          )
                        }
                        name={requiredName}
                      >
                        <option disabled value="">
                          Is it Required
                        </option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      <LinkedErrorMessage name={requiredName} />
                    </div>
                    <div
                      className="col-12"
                      data-custom-validation-field
                      data-field-name={placeholderName}
                    >
                      <h4>What will be the question</h4>
                      <input
                        type="text"
                        value={value.placeholder}
                        placeholder="Enter value"
                        onChange={(event) =>
                          handleInputChange(
                            index,
                            "placeholder",
                            event.target.value
                          )
                        }
                        name={placeholderName}
                      />
                      <LinkedErrorMessage name={placeholderName} />
                    </div>
                  </div>
                ) : (
                  <div className="col-lg-8 col-12 row mt--10">
                    <div
                      className="col-lg-3 col-md-6 col-12 mr--5 ver_section a-start"
                      data-custom-validation-field
                      data-field-name={requiredName}
                    >
                      <h4 className="mt--10">Is it required</h4>
                      <select
                        value={value.required}
                        onChange={(event) =>
                          handleInputChange(
                            index,
                            "required",
                            event.target.value
                          )
                        }
                        name={requiredName}
                      >
                        <option disabled value="">
                          Is it Required
                        </option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      <LinkedErrorMessage name={requiredName} />
                    </div>
                    <div
                      className="col-lg-3 col-md-6 col-12 mr--5 ver_section a-start"
                      data-custom-validation-field
                      data-field-name={multiselectName}
                    >
                      <h4 className="mt--10">
                        Let client select multiple values
                      </h4>
                      <select
                        value={value.multiselect}
                        onChange={(event) =>
                          handleInputChange(
                            index,
                            "multiselect",
                            event.target.value
                          )
                        }
                        name={multiselectName}
                      >
                        <option disabled value="">
                          Let client select multiple values
                        </option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      <LinkedErrorMessage name={multiselectName} />
                    </div>
                    <div
                      className="col-12 mt--10"
                      data-custom-validation-field
                      data-field-name={placeholderName}
                    >
                      <h4>What will be the question</h4>
                      <input
                        type="text"
                        value={value.placeholder}
                        placeholder="Enter text"
                        onChange={(event) =>
                          handleInputChange(
                            index,
                            "placeholder",
                            event.target.value
                          )
                        }
                        name={placeholderName}
                      />
                      <LinkedErrorMessage name={placeholderName} />
                    </div>
                    <div className="col-12 mt--10">
                      <StringDynamicInputs
                        name={`${inputPath}.options`}
                        onChange={(nextOptions) =>
                          handleInputChange(index, "options", nextOptions)
                        }
                        initialValues={value.options ?? []}
                        placeholder="Add option"
                      />
                    </div>
                  </div>
                ))}
              <hr className="mt--10" />
            </Fragment>
          );
        })
      ) : (
        <PlusButton onClick={addInput} />
      )}
    </div>
  );
};

InputsBuilder.propTypes = {
  initialValues: PropTypes.arrayOf(
    PropTypes.shape({
      multiselect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      options: PropTypes.arrayOf(PropTypes.string),
      placeholder: PropTypes.string,
      required: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      type: PropTypes.string,
    })
  ),
  max: PropTypes.number,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputsBuilder;
