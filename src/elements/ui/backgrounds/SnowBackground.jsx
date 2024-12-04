import React from "react";
import Snowfall from "react-snowfall";
import { HOLIDAYS } from "../../../util/configs/common";

const SnowBackground = () => {
  if (!HOLIDAYS.isWinter) {
    return;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        zIndex: "1",
      }}
    >
      <Snowfall snowflakeCount={200} />
    </div>
  );
};

export default SnowBackground;
