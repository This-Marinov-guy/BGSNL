import { useEffect } from "react";
import { withRouter } from 'react-router-dom';

const PageGoTop = (props) => {

    useEffect(() => {
    
        window.scrollTo(0, 0);
      }, []);

    return props.children;
};
export default withRouter(PageGoTop);