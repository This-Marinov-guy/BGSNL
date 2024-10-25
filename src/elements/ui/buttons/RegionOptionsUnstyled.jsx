import React, { useState } from "react";
import styles from "../../../layouts/common/RegionLayout.module.css";
import { REGIONS } from "../../../util/defines/REGIONS_DESIGN";

const RegionOptionsUnstyled = (props) => {
  return (
    <div className="row">
      {REGIONS.map((r, index) => {
        return (
          <a
            key={index}
            className={"col-lg-4 col-6 center_div mt--5 mb--5 " + styles[r]}
            href={props.links[r]}
            target="_blank"
            rel="noreferrer"
          >
            <button
              style={{ width: "100%" }}
              className={" rn-button-style--2 rn-btn-reverse-green"}
            >
              {r}
            </button>
          </a>
        );
      })}
    </div>
  );
};

export default RegionOptionsUnstyled;
