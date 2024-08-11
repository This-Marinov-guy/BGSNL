import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showInfoNotification } from '../../redux/information';

const AuthLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const routePath = location.pathname;
    
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const isAuthenticated = user && user.token;

    useEffect(() => {
        if (!isAuthenticated) {
            sessionStorage.setItem('prevUrl', routePath);
            dispatch(showInfoNotification({
                severity: 'warn',
                detail: 'Please log in your account to proceed to the page!'
            }));

            return navigate('/login');
        }
    }, []);

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default AuthLayout