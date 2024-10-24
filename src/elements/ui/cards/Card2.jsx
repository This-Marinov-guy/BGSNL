import React from "react";

const Card2 = ({ image, title, description, link, action }) => {
  return (
    <div className="col-12 mt--30">
      <div className="standard-service">
        <div className="thumbnai news-image">
          <img
            src={image}
            style={{ height: "5em", objectFit: "contain" }}
            alt="Corporate Images"
          />
        </div>
        <div className="content">
          <h3>
            <a href={link || ""}>{title}</a>
          </h3>
          <p>{description}</p>
          {action ? (
            <a className="btn-transparent rn-btn-dark" onClick={action}>
              <span className="text pointer">Click here</span>
            </a>
          ) : link ? (
            <a className="btn-transparent rn-btn-dark" href={link}>
              <span className="text">Read more</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Card2;
