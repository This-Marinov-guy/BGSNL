import React from "react";
import NewsList from "../lists/NewsList";
import UserTabHeader from "./UserTabHeader";

const NewsTab = () => {
  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="News" />
      <div className="tab-body">
        <NewsList withTitle={false} />
      </div>
    </div>
  );
};

export default NewsTab;
