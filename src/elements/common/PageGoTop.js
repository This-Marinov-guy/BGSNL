import { useEffect } from "react";
import { useNavigate } from "@/util/navigation";

const PageGoTop = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        
    }, [history]);

    return children;
};

export default PageGoTop;