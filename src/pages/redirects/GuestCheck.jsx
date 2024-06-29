import React from 'react'
import { useHttpClient } from '../../hooks/http-hook'

const GuestCheck = () => {
    const searchParams = new URLSearchParams(window.location.search);

    

    const { sendRequest, loading } = useHttpClient();

    const updateGuestList = async () => {
        
    }

    return (
        <div>GuestCheck</div>
    )
}

export default GuestCheck