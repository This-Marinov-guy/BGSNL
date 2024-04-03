import React, { useState } from 'react';

const StringDynamicInputs = (props) => {
  const [inputs, setInputs] = useState(props.intValues.length > 0 ? props.intValues : ['']);

  const addInput = () => {
    if (props.max && props.max > inputs.length) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
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

  return (
    <>
      {inputs.map((value, index) => (
        <div className='hor_section_nospace mt--10' key={index}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
          <button type='button' className='rn-btn' onClick={() => removeInput(index)} disabled={inputs.length === 1 && index === 0}>
            X
          </button>
        </div>
      ))}
      <button type='button' className='rn-btn rn-btn-green' style={{ fontSize: '22px' }} onClick={addInput}>
        +
      </button>
    </>
  );
};

export default StringDynamicInputs;
