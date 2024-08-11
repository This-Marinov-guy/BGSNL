import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { selectUser } from '../redux/user';

const AuthLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const routePath = location.pathname;
    
    const user = useSelector(selectUser);

    const isAuthenticated = user && user.token;

    useEffect(() => {
        if (!isAuthenticated) {
            sessionStorage.setItem('prevUrl', routePath);
            return navigate('/login');
        }
    }, []);

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default AuthLayout