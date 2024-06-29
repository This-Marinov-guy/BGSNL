import React, { useState, useEffect } from 'react'
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { useHttpClient } from '../../hooks/http-hook'
import PageLoading from '../../elements/ui/PageLoading';
import { useNavigate } from 'react-router-dom';
import HeaderTwo from '../../component/header/HeaderTwo';

const GuestCheck = () => {
    const searchParams = new URLSearchParams(window.location.search);

    const event = searchParams.get('event');
    const name = searchParams.get('name') + ' ' + searchParams.get('surname');
    const email = decodeURIComponent(searchParams.get('email'));
    const count = searchParams.get('count');

    const { sendRequest, loading } = useHttpClient();
    const [timeoutId, setTimeoutId] = useState(null);
    const [status, setStatus] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [message, setMessage] = useState(null);
    const [eventName, setEventName] = useState(null);

    const navigate = useNavigate();


    const handleCountChange = (e) => {
        const newCount = e.target.value;
        searchParams.set('count', newCount);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
        }, 1000);

        setTimeoutId(newTimeoutId);
    };

    const updateGuestList = async () => {
        // const responseData = await sendRequest(
        //     'event/check-guest-list',
        //     "PATCH",
        //     {
        //         event,
        //         name,
        //         email,
        //         count: count || null
        //     }
        // )
        const responseData = {
            status: 0,
            event: 'Test'
        }

        if (responseData !== undefined) {
            setStatus(responseData.status);
            setEventName(responseData.event);
        } else {
            return;
        }


        switch (responseData.status) {
            case 0:
                setSeverity('info');
                setMessage('Guest is already checked-in')
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
                return;
        }
    }

    useEffect(() => {
        if (!(email && name && event)) {
            return navigate('/');
        }

        updateGuestList();
    }, [window.location.href])

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    if (loading) {
        return <PageLoading />
    }

    const info = <div className="col-lg-12">
        <p>Event: {eventName}</p>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Count of guests: {count || 'Not specified'}</p>
    </div>

    switch (status) {
        case 0:
        case 2:
            return (
                <>
                    <HeaderTwo logo="light" />
                    <div className="container center_text mt--160">
                        <div className="row">
                            <div className="col-lg-12 mb--40">
                                <Message severity={severity} text={message} />
                            </div>
                            {info}
                        </div>
                    </div>
                </>
            )
        case 1:
            return (
                <>
                    <HeaderTwo logo="light" />
                    <div className="container center_text mt--160">
                        <div className="row">
                            <div className="col-lg-12">
                                <Message severity={severity} text={message} />
                            </div>
                            <div className="col-lg-12 mt--40 mb--40">
                                <h3>
                                    Ticket Count
                                </h3>
                                <InputNumber value={count || 1} onValueChange={handleCountChange} showButtons buttonLayout="horizontal" style={{ width: '160px' }}
                                    decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" min={1} max={10}
                                />
                            </div>
                            {info}
                        </div>
                    </div>
                </>
            )
        default:
            return <>
                <HeaderTwo logo="light" />
                <PageLoading />
            </>
    }
}

export default GuestCheck