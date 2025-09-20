import React from "react";
import PropTypes from "prop-types";
import NewsList from "../lists/NewsList";

const NewsTab = () => {
  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Latest News & Updates</h2>
        <p>Stay updated with the latest announcements and news from BGSNL.</p>
      </div>
      <div className="tab-body">
        <NewsList />
      </div>
    </div>
  );
};

NewsTab.propTypes = {};

export default NewsTab;
