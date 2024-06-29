import React, { useState, useEffect } from 'react'

import { Message } from 'primereact/message';
import { useHttpClient } from '../../hooks/http-hook'
import PageLoading from '../../elements/ui/PageLoading';
import { useNavigate } from 'react-router-dom';

const GuestCheck = () => {
    const searchParams = new URLSearchParams(window.location.search);

    const event = searchParams.get('event');
    const name = searchParams.get('name') + ' ' + searchParams.get('surname');
    const email = decodeURIComponent(searchParams.get('email'));
    const count = searchParams.get('count');

    const { sendRequest, loading } = useHttpClient();
    const [status, setStatus] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();

    const updateGuestList = async () => {
        const responseData = await sendRequest(
            'event/check-guest-list',
            "PATCH",
            {
                event,
                name,
                email,
                count: count || null
            }
        )

        if (responseData !== undefined) {
            setStatus(responseData.status);
        } else {
            return
        }

        switch (responseData.status) {
            case 0:
                setSeverity('info');
                setMessage('Client is already checked in')
                break;
            case 1:
                setSeverity('warn');
                setMessage('We have found multiple purchases with from the guest. Please specify the count of tickets to update')
                break;
            case 2:
                setSeverity('success');
                setMessage('Guest list has been updated')
                break;
            default:
                return
        }
    }

    useEffect(() => {
        if (!(email && name && event)) {
            return navigate('/');
        }

        updateGuestList();
    }, [window.location])

    if (loading) {
        return <PageLoading />
    }

    const info = <div className="col-lg-12">
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Count of guests: {count || 'Not specified'}</p>
    </div>

    switch (status) {
        case 0:
        case 2:
            return (
                <div className="container mt--20">
                    <div className="row">
                        <div className="col-lg-12">
                            <Message severity={severity} text={message} />
                        </div>
                        {info}
                    </div>
                </div>
            )
        case 1:
            return (
                <div className="container mt--20">
                    <div className="row">
                        <div className="col-lg-12">
                            <Message severity={severity} text={message} />
                        </div>
                        <div className="col-sm-12 col-lg-6 mb--40">
                            <div className="rn-form-group">
                                <input type='number' placeholder='Specify count' onChange={(e) => {
                                    searchParams.set('count', e.target.value)
                                }} />
                            </div>
                        </div>
                        {info}
                    </div>
                </div>
            )
        default:
            return <PageLoading />
    }
}

export default GuestCheck