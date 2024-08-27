
import React from "react";
import { Link } from "react-router-dom";

const PortfolioList2 = (props) => {
    const { target, column, styevariation } = props;

    return (
        <React.Fragment>
            {target
                .map((value, index) => (
                    <div className={`${column}`} key={index}>
                        <div className={`portfolio-2 ${styevariation}`}>
                            <div className="thumbnail-inner" >
                                <div className={`thumbnail`} style={{ backgroundImage: `url(${value.image})` }}></div>
                            </div>
                            <div className="content">
                                <div className="inner">
                                    <p>{value.title}</p>
                                    <h4><Link to={value.link}>{value.description}</Link></h4>
                                    <Link className="rn-button-style--2 rn-btn-reverse-green" to={value.link}>View Details</Link>
                                </div>
                            </div>
                            <Link className="link-overlay" to={value.link}></Link>
                        </div>
                    </div>
                ))}
        </React.Fragment>
    );
};

export default PortfolioList2;
