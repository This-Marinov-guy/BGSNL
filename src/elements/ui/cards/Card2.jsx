import React from "react";
import { Link } from "react-router-dom";

const Card2 = (props) => {
  const {
    image,
    fallbackImage = "",
    title,
    description,
    links,
    action,
    isInsideLink = false,
  } = props;

  return (
    <div className="col-12 mt--30">
      <div className="standard-service">
        <div className="thumbnai news-image">
          <img
            src={image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
            style={{ height: "5em", objectFit: "contain" }}
            alt="Corporate Images"
          />
        </div>
        <div className="content">
          <h3>
            <a href={links[0].href ?? ""}>{title}</a>
          </h3>
          <p>{description}</p>
          {action ? (
            <a className="btn-transparent rn-btn-dark" onClick={action}>
              <span className="text pointer">Click here</span>
            </a>
          ) : links[0].href ? (
            isInsideLink ? (
              <Link className="btn-transparent rn-btn-dark" to={links[0].href}>
                <span className="text">{links[0].name || "Read more"}</span>
              </Link>
            ) : (
              <a className="btn-transparent rn-btn-dark" href={links[0].href}>
                <span className="text"> {links[0].name || "Read more"}</span>
              </a>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Card2;
