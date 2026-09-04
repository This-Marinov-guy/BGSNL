import React from "react";
import ImageFb from "../ui/media/ImageFb";
import { Link } from "@/util/navigation";
import { useParams } from "@/util/navigation";

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
                eager
              />
            </Link>
          </div>
        ))}
    </React.Fragment>
  );
};

export default PortfolioList;
