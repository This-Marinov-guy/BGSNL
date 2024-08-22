import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi';

const WithBackBtn = (props) => {
    const navigate = useNavigate();

    return (
        <div className="mt--40" >
            <p onClick={() => navigate(-1)} className='information mr--20' style={{ cursor: 'pointer', display: 'inline' }}>
                <FiChevronLeft />
                Back |
            </p>
            {props.children}
        </div>

    )
}

export default WithBackBtn