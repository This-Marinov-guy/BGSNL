import React from "react";
import ImageFb from "../ui/media/ImageFb";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const PortfolioList = (props) => {
  const { region } = useParams();

  return (
    <React.Fragment>
      {props.target
        .map((value, index) => (
          <div style={{ margin: '60px 10px' }} className={`portfolio ${props.column} ${props.stylevariation}`} key={index}>
            <Link
              to={
                props.style === "society"
                  ? `/${value.region ?? region}/event-details/${value.id}`
                  : `/${value.region ?? region}/other-event-details/${value.id}`
              }
              className={
                props.style === "society"
                  ? "thumbnail-inner"
                  : "thumbnail-inner-2"
              }
            >
              <ImageFb
                className="thumbnail portfolio-img"
                src={value.poster}
                alt="Event Images"
              />
            </Link>
          </div>
        ))}
    </React.Fragment>
  );
};

export default PortfolioList;
