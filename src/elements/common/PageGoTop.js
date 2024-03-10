import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const PageGoTop = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        
    }, [history]);

    return children;
};

export default PageGoTop;