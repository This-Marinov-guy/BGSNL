import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showInfoNotification } from '../../redux/information';

const GuestLayout = ({ children }) => {
    const navigate = useNavigate();

    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const isAuthenticated = (user && !!user.token) || localStorage.getItem('userData');

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(showInfoNotification({
                severity: 'warn',
                detail: 'You are already logged into your account - please log out and then proceed to this page!'
            }));

            return navigate('/user');
        }
    }, []);

    return !isAuthenticated ? children : <Navigate to="/user" />;
};

export default GuestLayout