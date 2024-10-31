import React, { Component, Fragment, useEffect, useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import { useHttpClient } from "../../hooks/common/http-hook";
import CustomSpinner from "../ui/loading/CustomSpinner";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";

const CounterOne = () => {
  const [didViewCountUp, setDidViewCountUp] = useState(false);
  const [data, setData] = useState({});

  const { loading, sendRequest } = useHttpClient();

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await sendRequest("common/get-about-data");
      setData(response);
    };

    fetchCounts();
  }, []);

  const STATISTICS = [
    {
      countNum: REGIONS.length,
      countTitle: "Cities, part of our network",
    },
    {
      countNum: loading || !data?.events ? <CustomSpinner /> : data?.events,
      icon: "+",
      countTitle: "Events that we have hosted by today",
    },
    {
      countNum: loading || !data?.members ? <CustomSpinner /> : data?.members,
      countTitle: "Members, part of the society",
    },
    {
      countNum:
        loading || !data?.activeMembers ? (
          <CustomSpinner />
        ) : data?.activeMembers < 60 ? (
          65
        ) : (
          data?.activeMember
        ),
      countTitle: "Active contributors to the society",
    },
    {
      countNum: loading || !data?.tickets ? <CustomSpinner /> : data?.tickets,
      icon: "+",
      countTitle: "Tickets sold",
    },
  ];

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
                <CountUp end={didViewCountUp ? value.countNum : 0} />
              </VisibilitySensor>
            </h5>
            <p className="description">{value.countTitle}</p>
          </div>
        ))}
      </div>
    </Fragment>
  );
};
export default CounterOne;
