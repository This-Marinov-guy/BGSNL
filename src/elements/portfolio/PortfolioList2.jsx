import React from "react";
import { Link } from "react-router-dom";

const PortfolioList2 = (props) => {
  const { target, column, styevariation } = props;

  return target.map((value, index) => (
    <div className={`mt--20 mb--20 ${column}`} key={index}>
      <div className={`portfolio-2 ${styevariation}`}>
        <div className="thumbnail-inner">
          <div
            className={`thumbnail`}
            style={{ backgroundImage: `url(${value.poster})` }}
          ></div>
        </div>
        <div className="content">
          <div className="inner">
            <p>{value.title}</p>
            <h4>
              <Link to={`/${value.region ?? region}/event-details/${value.id}`}>
                {value.description}
              </Link>
            </h4>
            <Link
              className="rn-button-style--2 rn-btn-reverse-green"
              to={`/${value.region ?? region}/event-details/${value.id}`}
            >
              View Details
            </Link>
          </div>
        </div>
        <Link
          className="link-overlay"
          to={`/${value.region ?? region}/event-details/${value.id}`}
        ></Link>
      </div>
    </div>
  ));
};

export default PortfolioList2;
