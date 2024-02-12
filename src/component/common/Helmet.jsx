import React, { Component } from "react";
import { Helmet } from "react-helmet";

class PageHelmet extends Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>BGSNL || {this.props.pageTitle} </title>
        </Helmet>
      </React.Fragment>
    );
  }
}

export default PageHelmet;
