import React, { Fragment, useState } from 'react';
import StringDynamicInputs from './StringDynamicInputs';
import PlusButton from '../ui/buttons/PlusButton';
import XButton from '../ui/buttons/XButton';

const InputsBuilder = (props) => {
    //schema
    const emptyInputObj = { type: '', placeholder: '', required: false, multiselect: false, options: [] };

    const [inputs, setInputs] = useState(props.initialValues?.length > 0 ? props.initialValues : []);

    const addInput = (type) => {
        if (props.max > inputs.length) {
            const newInput = { type, placeholder: '', required: false }
            if (type === 'select') {
                newInput = emptyInputObj;
            }
            setInputs([...inputs, newInput]);
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
        newInputs[index][name] = value;
        setInputs(newInputs);
        props.onChange(newInputs);
    };

    return (
        <>
            {inputs.length > 0 ? inputs.map((value, index) => (
                <Fragment key={index}>
                    <h3 className='mt--20'>Input {index + 1}</h3>
                    <div className='row mt--10' key={index}>
                        <h4 className='col-12'>Select type of input</h4>
                        <select
                            value={value.type}
                            onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                            name='type'
                            className='col-7'
                        >
                            <option disabled selected value=''>Select</option>
                            <option value='text'>Text</option>
                            <option value='select'>Select</option>
                        </select>
                        <PlusButton onClick={() => addInput(value.type)} />
                        <XButton onClick={() => removeInput(index)} />
                    </div>
                    {value.type && (value.type === 'text' ?
                        <div className='row mt--10'>
                            <div className='col-6'>
                                <h4>Is it required</h4>
                                <select
                                    value={value.required}
                                    onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                                    name='required'
                                >
                                    <option disabled value=''>Is it Required</option>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                            <div className='col-12'>
                                <h4>What will be the question</h4>
                                <input type='text'
                                    placeholder='Enter value'
                                    onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                                    name='placeholder' ></input>
                            </div>
                        </div>
                        :
                        <div className='row mt--10'>
                            <div className='col-5 mr--5'>
                                <h4>Is it required</h4>
                                <select
                                    value={value.required}
                                    onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                                    name='required'
                                >
                                    <option disabled value=''>Is it Required</option>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                            <div className='col-5'>
                                <h4>Let client select multiple values</h4>
                                <select
                                    value={value.multiselect}
                                    onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                                    name='multiselect'
                                >
                                    <option disabled value=''>Let client select multiple values</option>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                            <div className='col-12 mt--10'>
                                <h4>What will be the question</h4>
                                <input type='text'
                                    placeholder='Enter text'
                                    onChange={(e) => handleInputChange(index, e.target.name, e.target.value)}
                                    name='placeholder' ></input>
                            </div>
                            <StringDynamicInputs onChange={(inputs) => handleInputChange(index, 'options', inputs)} initialValues={value.options ?? []} placeholder='Add option' />
                        </div>
                    )}
                </Fragment>
            )) :
                <PlusButton onClick={() => addInput('')} />}
        </>
    );
};

InputsBuilder.defaultProps = {
    max: 5
}

export default InputsBuilder;
