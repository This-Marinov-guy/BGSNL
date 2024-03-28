import React, { useState } from 'react';

const DynamicInputComponent = () => {
  const [inputs, setInputs] = useState(['']); 

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const removeInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitted values:', inputs);
  };

  return (
    <form onSubmit={handleSubmit}>
      {inputs.map((value, index) => (
        <div key={index}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
          <button className='rn-btn'  onClick={() => removeInput(index)} disabled={inputs.length === 1 && index === 0}>
            X
          </button>
        </div>
      ))}
      <button className='rn-btn-reverse-green' onClick={addInput}>
        +
      </button>
      <button type="submit">
        Submit
      </button>
    </form>
  );
};

export default DynamicInputComponent;
