import React from "react";
import ImageFb from "../ui/ImageFb";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const PortfolioList = (props) => {

  const {region} = useParams();

  return (
    <React.Fragment>
      {props.target.map((value, index) => (
        <div className="portfolio portfolio-slider" key={index}>
          <Link
            to={
              props.style === "society"
                ? `/${region}/event-details/${value.title}`
                : `/${region}/other-event-details/${value.title}`
            }
            className={
              props.style === "society"
                ? "thumbnail-inner"
                : "thumbnail-inner-2"
            }
          >
            <ImageFb
              className="thumbnail portfolio-img"
              src={`${value.thumbnail}.webp`}
              fallback={`${value.thumbnail}.jpg`}
              alt="Event Images"
            />
          </Link>
        </div>
      ))}
    </React.Fragment>
  );
};

export default PortfolioList;
