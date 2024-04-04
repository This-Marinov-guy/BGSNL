import React, { Fragment, useState } from 'react';
import StringDynamicInputs from './StringDynamicInputs';

const InputsBuilder = (props) => {
    const emptyInputObj = { type: '', placeholder: '', required: false, options: [] }
    const [inputs, setInputs] = useState(props.intValues?.length > 0 ? props.intValues : [emptyInputObj]);

    const addInput = (type) => {
        if (props.max > inputs.length) {
            const newInput = { type, placeholder: '', required: false }
            if (type === 'select') {
                newInput = { ...newInput, options: [] }
            }
            setInputs([...inputs, newInput]);
        }
    };

    const removeInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
        // props.onChange(newInputs);
    };

    const handleInputChange = (index, value) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
        // props.onChange(newInputs);
    };

    return (
        <>
            {inputs.map((value, index) => (
                <Fragment key={index}>
                    <div className='row mt--10' style={{ gap: '1%' }} key={index}>
                        <select
                            value={value.type}
                            onChange={(e) => value.type = e.target.value}
                            className='col-7'
                        >
                            <option disabled selected value=''>Select type of input</option>
                            <option value='text'>Text</option>
                            <option value='select'>Select</option>
                        </select>
                        <button type='button' className='col-2 rn-btn rn-btn-green' style={{ fontSize: '22px' }} onClick={() => addInput(value.type)}>
                            +
                        </button>
                        <button type='button' className='col-2 rn-btn' onClick={() => removeInput(index)} disabled={inputs.length === 1 && index === 0}>
                            X
                        </button>
                    </div>
                    {value.type && (value.type === 'text' ?
                        <div className='row mt--10'>
                            <select
                                value={value.type}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                className='col-lg-6 col-12'
                            >
                                <option disabled selected value=''>Required</option>
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                            </select>
                            <input type='text' className='col-lg-6 col-12' onClick={() => addInput(value.type)} ></input>
                        </div>
                        :
                        <div className='row mt--10'>
                            <div className='row mt--10'>
                                <select
                                    value={value.type}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    className='col-lg-6 col-12'
                                >
                                    <option disabled selected value=''>Required</option>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                                <StringDynamicInputs onChange={(inputs) => value.options = inputs} placeholder='Add option' />
                            </div>
                        </div>)}

                </Fragment>
            ))}

        </>
    );
};

InputsBuilder.defaultProps = {
    max: 5
}

export default InputsBuilder;
