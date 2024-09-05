import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showNotification } from '../../redux/notification';
import { checkAuthorization } from '../../util/functions/authorization';

const AuthLayout = ({ children, access = [] }) => {
    const location = useLocation();
    const routePath = location.pathname + location.hash + location.search;
    
    const user = useSelector(selectUser);

    const dispatch = useDispatch();

    const isAuthenticated = (user && !!user.token) || localStorage.getItem('userData');

    let navigatePath = "/login";

    useEffect(() => {
        if (!isAuthenticated) {
            sessionStorage.setItem('prevUrl', routePath);
            dispatch(showNotification({
                severity: 'warn',
                detail: 'Please log in your account to proceed to the page!'
            }));

            navigatePath = "/login";
        } else if (access && access.length > 0 && !checkAuthorization(user.token, access)) {
            dispatch(showNotification({
                severity: 'error',
                detail: 'You do not have access to this page'
            }));

            navigatePath = "/user";
        }
    }, [])

    return isAuthenticated ? children : <Navigate to={navigatePath} />;
};

export default AuthLayout