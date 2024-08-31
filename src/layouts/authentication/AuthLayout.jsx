import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showNotification } from '../../redux/notification';
import { checkAuthorization, decodeJWT } from '../../util/functions/authorization';

const AuthLayout = ({ children, access = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const routePath = location.pathname;
    
    const user = useSelector(selectUser);

    const dispatch = useDispatch();

    const isAuthenticated = (user && !!user.token) || localStorage.getItem('userData');

    if (!isAuthenticated) {
        sessionStorage.setItem('prevUrl', routePath);
        dispatch(showNotification({
            severity: 'warn',
            detail: 'Please log in your account to proceed to the page!'
        }));

        return navigate('/login');
    }

    if (access && access.length > 0 && !checkAuthorization(user.token, access)) {
        dispatch(showNotification({
            severity: 'error',
            detail: 'You do not have access to this page'
        }));

        return navigate('/user');
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default AuthLayout