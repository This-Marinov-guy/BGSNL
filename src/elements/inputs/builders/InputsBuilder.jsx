import React, { Fragment, useState } from "react";
import StringDynamicInputs from "../common-complicated/StringDynamicInputs";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";

const InputsBuilder = (props) => {
  //schema
  const emptyInputObj = {
    type: "",
    placeholder: "",
    required: false,
    multiselect: false,
    options: [],
  };

  console.log('dasdas');
  
  const [inputs, setInputs] = useState(
    props.initialValues?.length > 0 ? props.initialValues : []
  );

  const addInput = () => {
    if (props.max > inputs.length) {
      setInputs([...inputs, emptyInputObj]);
    }
  };

  const removeInput = (index) => {
    // if (inputs.length === 1 && index === 0) {
    //     return
    // }

    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
    props.onChange(newInputs);
  };

  const handleInputChange = (index, name, value) => {
    const newInputs = [...inputs]; 
    newInputs[index] = { ...newInputs[index] };
    newInputs[index][name] = value; 
    setInputs(newInputs);
    props.onChange(newInputs); 
  };

  return (
    <>
      {inputs.length > 0 ? (
        inputs.map((value, index) => (
          <Fragment key={index}>
            <h3 className="mt--20">Input {index + 1}</h3>
            <div className="row ml--5 mt--10" key={index}>
              <h4 className="col-lg-6 col-12">Select type of input</h4>
              <select
                value={inputs[index].type}
                onChange={(e) =>
                  handleInputChange(index, e.target.name, e.target.value)
                }
                name="type"
                className="col-7"
              >
                <option disabled selected value="">
                  Choose type
                </option>
                <option value="text">Text</option>
                <option value="select">Select</option>
              </select>
              <PlusButton onClick={addInput} />
              <XButton onClick={() => removeInput(index)} />
            </div>
            {value.type &&
              (value.type === "text" ? (
                <div className="row mt--10">
                  <div className="col-6">
                    <h4>Is it required</h4>
                    <select
                      value={inputs[index].required}
                      onChange={(e) =>
                        handleInputChange(index, e.target.name, e.target.value)
                      }
                      name="required"
                    >
                      <option disabled value="">
                        Is it Required
                      </option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <h4>What will be the question</h4>
                    <input
                      type="text"
                      value={inputs[index].placeholder}
                      placeholder="Enter value"
                      onChange={(e) =>
                        handleInputChange(index, e.target.name, e.target.value)
                      }
                      name="placeholder"
                    ></input>
                  </div>
                </div>
              ) : (
                <div className="col-lg-8 col-12 row mt--10">
                  <div className="col-lg-3 col-md-6 col-12 mr--5 ver_section a-start">
                    <h4 className="mt--10">Is it required</h4>
                    <select
                      value={inputs[index].required}
                      onChange={(e) =>
                        handleInputChange(index, e.target.name, e.target.value)
                      }
                      name="required"
                    >
                      <option disabled value="">
                        Is it Required
                      </option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div className="col-lg-3 col-md-6 col-12 mr--5 ver_section a-start">
                    <h4 className="mt--10">
                      Let client select multiple values
                    </h4>
                    <select
                      value={inputs[index].multiselect}
                      onChange={(e) =>
                        handleInputChange(index, e.target.name, e.target.value)
                      }
                      name="multiselect"
                    >
                      <option disabled value="">
                        Let client select multiple values
                      </option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div className="col-12 mt--10">
                    <h4>What will be the question</h4>
                    <input
                      type="text"
                      value={inputs[index].placeholder}
                      placeholder="Enter text"
                      onChange={(e) =>
                        handleInputChange(index, e.target.name, e.target.value)
                      }
                      name="placeholder"
                    ></input>
                  </div>
                  <div className="col-12 mt--10">
                    <StringDynamicInputs
                      onChange={(inputs) =>
                        handleInputChange(index, "options", inputs)
                      }
                      initialValues={inputs[index].options ?? []}
                      placeholder="Add option"
                    />
                  </div>
                </div>
              ))}
            <hr className="mt--10" />
          </Fragment>
        ))
      ) : (
        <PlusButton onClick={addInput} />
      )}
    </>
  );
};

InputsBuilder.defaultProps = {
  max: 5,
};

export default InputsBuilder;
