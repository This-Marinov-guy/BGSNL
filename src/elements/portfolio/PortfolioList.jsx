import React from "react";
import ImageFb from "../ui/ImageFb";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const PortfolioList = (props) => {

  const { region } = useParams();

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="slick-space-gutter--15 slickdot--100">
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
        </div>
      </div>
    </div>
  );
};

export default PortfolioList;
