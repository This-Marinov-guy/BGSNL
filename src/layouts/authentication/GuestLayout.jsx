import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showNotification } from '../../redux/notification';
import { LOCAL_STORAGE_USER_DATA } from '../../util/defines/common';

const GuestLayout = ({ children }) => {
    const navigate = useNavigate();

    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const isAuthenticated = (user && !!user.token) || localStorage.getItem(LOCAL_STORAGE_USER_DATA);

    let navigatePath = "/user";

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(showNotification({
                severity: 'warn',
                detail: 'You are already logged into your account - please log out and then proceed to this page!'
            }));

            navigatePath = '/user';
        }
    }, []);

    return !isAuthenticated ? children : <Navigate to={navigatePath} />;
};

export default GuestLayout