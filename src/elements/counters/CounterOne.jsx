import React, { Component, Fragment, useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import { STATISTICS } from "../../util/defines/GLOBAL_INFO";

const CounterOne = () => {
  const [didViewCountUp, setDidViewCountUp] = useState(false);
  
  const onVisibilityChange = (isVisible) => {
    if (isVisible) {
      setDidViewCountUp(true);
    }
  };

  return (
    <Fragment>
      <div className="row center_div">
        {STATISTICS.map((value, index) => (
          <div
            className="counterup_style--1 col-lg-4 col-md-4 col-sm-6 col-12"
            key={index}
          >
            <h5 className="counter">
              {value.icon}
              <VisibilitySensor
                onChange={onVisibilityChange}
                offset={{ top: 10 }}
                delayedCall
              >
                  <CountUp
                    end={didViewCountUp ? value.countNum : 0}
                  />
              </VisibilitySensor>
            </h5>
            <p className="description">{value.countTitle}</p>
          </div>
        ))}
      </div>
    </Fragment>
  );
}
export default CounterOne;
