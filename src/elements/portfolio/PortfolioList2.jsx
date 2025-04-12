import React from "react";
import { Link } from "react-router-dom";

const PortfolioList2 = (props) => {
  const { target, column, styevariation, special } = props;

  return target.map((value, index) => {
    const link = special
      ? `/other-event-details/pwc-career-pathways`
      : `/${value.region ?? region}/event-details/${value.id}`;

    return (
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
              {/* <p>{value.description}</p> */}
              <h4>
                <Link to={link}>{value.title}</Link>
              </h4>
              <Link
                className="rn-button-style--2 rn-btn-reverse-green"
                to={link}
              >
                View Details
              </Link>
            </div>
          </div>
          <Link className="link-overlay" to={link}></Link>
        </div>
      </div>
    );
  });
};

export default PortfolioList2;
