import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi';

const BackBtn = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)} className='rn-btn mr--10 ml--10'>
            <FiChevronLeft />
            Back
        </button >
    )
}

export default BackBtn