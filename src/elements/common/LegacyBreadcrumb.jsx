import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "@/util/navigation";

/**
 * The original image-overlay breadcrumb, retained for screens that still need
 * the previous presentation. New pages should use `Breadcrumb` instead.
 */
class LegacyBreadcrumb extends Component {
  render() {
    const {
      category,
      extraElement,
      imageUrl = "/assets/images/bg/bg-image-1.webp",
      parent,
      title,
    } = this.props;

    return (
      <div
        className="breadcrumb-area rn-bg-color ptb--50 bg_image"
        style={{ backgroundImage: `url(${imageUrl})` }}
        data-black-overlay="6"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-inner pt--100">
                <h2 className="title">{title}</h2>
                <ul className="page-list">
                  <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  {parent ? <li className="breadcrumb-item">{parent}</li> : null}
                  <li className="breadcrumb-item active">{category ?? title}</li>
                </ul>
              </div>
            </div>
            {extraElement ? (
              <div className="col-lg-12 mt--20">{extraElement}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

LegacyBreadcrumb.propTypes = {
  category: PropTypes.string,
  extraElement: PropTypes.node,
  imageUrl: PropTypes.string,
  parent: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default LegacyBreadcrumb;
