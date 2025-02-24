import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";

const Loader = () => {
  return (
    <div
      style={{ margin: "auto", width: "2.6em" }}
      className="d-flex align-items-center justify-content-center g--3 disabled"
    >
      <span style={{ fontSize: "18px" }}>Loading </span>
      <ProgressSpinner
        style={{ width: "20px", height: "20px" }}
        strokeWidth="8"
        animationDuration=".5s"
      />
    </div>
  );
};

export default Loader;
