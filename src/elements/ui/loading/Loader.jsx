import React from "react";
import { ProgressSpinner } from "@/compat/primereact";

const Loader = () => {
  return (
    <div
      style={{ margin: "auto" }}
      className="d-flex align-items-center justify-content-center g--3 disabled"
    >
      <span>Loading </span>
      <ProgressSpinner
        style={{ width: "20px", height: "20px" }}
        strokeWidth="8"
        animationDuration=".5s"
      />
    </div>
  );
};

export default Loader;
