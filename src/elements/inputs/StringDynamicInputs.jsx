import React, { useState } from 'react';
import XButton from '../ui/buttons/XButton';
import PlusButton from '../ui/buttons/PlusButton';

const StringDynamicInputs = (props) => {
  const [inputs, setInputs] = useState(props.initialValues?.length > 0 ? props.initialValues : []);

  const addInput = () => {
    if (props.max > inputs.length) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
    // if (inputs.length === 1 && index === 0) {
    //   return
    // }

    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
    props.onChange(newInputs);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    props.onChange(newInputs);
  };

  const placeholder = (index) => {
    if (index == 0) {
      if (props.placeholder) {
        return props.placeholder
      } else {
        return 'Initial value'
      }
    } else {
      return 'Additional field'
    }
  }

  return (
    <>
      {inputs.map((value, index) => (
        <div className='hor_section_nospace mt--10' key={index}>
          <input
            type="text"
            value={value}
            placeholder={placeholder(index)}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
          <XButton onClick={() => removeInput(index)} />
        </div>
      ))}
      <PlusButton className='mt--10' onClick={addInput} />
    </>
  );
};

StringDynamicInputs.defaultProps = {
  max: 100
}

export default StringDynamicInputs;
