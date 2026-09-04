import React from "react";
import { Link, useParams } from "@/util/navigation";

const PortfolioList2 = (props) => {
  const { target, column, styevariation, special } = props;
  const { region } = useParams();

  return target.map((value, index) => {
    const link = special
      ? `/other-event-details/pwc-career-pathways`
      : `/${value.region ?? region}/event-details/${value.id}`;

    return (
      <div className={`mt--20 mb--20 ${column}`} key={index}>
        <div className={`portfolio-2 ${styevariation}`}>
          <div className="thumbnail-inner">
            <div className="thumbnail">
              <img
                src={value.poster}
                alt={`${value.title} poster`}
                loading="eager"
                decoding="async"
              />
            </div>
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
