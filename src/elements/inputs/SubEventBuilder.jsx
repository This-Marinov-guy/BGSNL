import React, { useState } from 'react';
import PlusButton from '../ui/buttons/PlusButton';
import XButton from '../ui/buttons/XButton';

const SubEventBuilder = (props) => {
    const emptyInputObj = { description: '', links: [{ name: '', href: '' }] };
    const [input, setInput] = useState(props.initialValues ?? emptyInputObj);

    const addLink = () => {
        setInput(prevInput => ({
            ...prevInput,
            links: [...prevInput.links, { name: '', href: '' }]
        }));
        // props.onChange(input);
    };

    const removeLink = (linkIndex) => {
        if (input.links.length > 1) {
            setInput(prevInput => ({
                ...prevInput,
                links: prevInput.links.filter((_, index) => index !== linkIndex)
            }));
            // props.onChange(input);
        }
    };

    const handleLinkChange = (linkIndex, field, value) => {
        setInput(prevInput => ({
            ...prevInput,
            links: prevInput.links.map((link, index) =>
                index === linkIndex ? { ...link, [field]: value } : link
            )
        }));
        // props.onChange(input);
    };

    const handleDescriptionChange = (value) => {
        setInput(prevInput => ({
            ...prevInput,
            description: value
        }));
        // props.onChange(input);
    };

    return (
        <div className='row'>
            <div className="col-12 mt--20">
                <h5>Link a sub-event (it will appear below the main to navigate the users to related events)</h5>
                <input
                    type='text'
                    placeholder='Type the description'
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    value={input.description}
                />
                <div className='row mt--10 mb--10'>
                    {input.links.map((link, linkIndex) => (
                        <div className='center_div_col col-4 mb--10' key={linkIndex}>
                            <input
                                type='text'
                                placeholder='Name'
                                value={link.name}
                                onChange={(e) => handleLinkChange(linkIndex, 'name', e.target.value)}
                            />
                            <input
                                type='text'
                                placeholder='Link'
                                value={link.href}
                                onChange={(e) => handleLinkChange(linkIndex, 'href', e.target.value)}
                            />
                            <div className='mt--10 center_div'>
                                <XButton onClick={() => removeLink(linkIndex)} />
                                <PlusButton onClick={addLink} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubEventBuilder;