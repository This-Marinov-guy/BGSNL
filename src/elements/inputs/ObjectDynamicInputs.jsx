import React, { useState } from 'react';

const DynamicInputComponent = () => {
    const [inputs, setInputs] = useState([{ name: '', value: '' }]); 

    // Function to handle adding a new input pair
    const addInputPair = () => {
        setInputs([...inputs, { name: '', value: '' }]);
    };

    // Function to handle removing an input pair by index
    const removeInputPair = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

    // Function to handle updating input value by index and property
    const handleInputChange = (index, propertyName, propertyValue) => {
        const newInputs = [...inputs];
        newInputs[index][propertyName] = propertyValue;
        setInputs(newInputs);
    };

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Submitted values:', inputs);
    };

    return (
        <form onSubmit={handleSubmit}>
            {inputs.map((inputPair, index) => (
                <div key={index}>
                    <input
                        type="text"
                        value={inputPair.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        placeholder="Name"
                    />
                    <input
                        type="text"
                        value={inputPair.value}
                        onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                        placeholder="Value"
                    />
                    <button className="rb-btn" onClick={() => removeInputPair(index)} disabled={inputs.length === 1}>
                        X
                    </button>
                </div>
            ))}
            <button className="rn-btn-reverse-green" onClick={addInputPair}>
                +
            </button>
            <button type="submit">
                Submit
            </button>
        </form>
    );
};

export default DynamicInputComponent;
