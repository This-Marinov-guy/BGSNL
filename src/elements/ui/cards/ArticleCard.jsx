import React from 'react'
import { Link } from "react-router-dom";

const ArticleCard = (props) => {
  const {
      image,
      fallbackImage = '',
      title,
      description,
      link,
      action,
      isInsideLink = false,
    } = props;
  
    return (
      <div className="col-12 mt--30 mb--30">
        <div className="article-card">
          <div className="thumbnai article-image">
            <img
              src={image}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
              alt="Corporate Images"
            />
          </div>
          <div className="content mt--10">
            <h4>
              <a href={link || ""}>{title}</a>
            </h4>
            <p>{description}</p>
            {action ? (
              <a className="btn-transparent rn-btn-dark" onClick={action}>
                <span className="text pointer">Click here</span>
              </a>
            ) : link ? (
              isInsideLink ? (
                <Link className="btn-transparent rn-btn-dark" to={link}>
                  <span className="text">Read more</span>
                </Link>
              ) : (
                <a className="btn-transparent rn-btn-dark" href={link}>
                  <span className="text">Read more</span>
                </a>
              )
            ) : null}
          </div>
        </div>
      </div>
    );
}

export default ArticleCard