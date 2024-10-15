import React, { Component, Fragment, useEffect, useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import { useHttpClient } from "../../hooks/common/http-hook";
import CustomSpinner from "../ui/loading/CustomSpinner";

const CounterOne = () => {
  const [didViewCountUp, setDidViewCountUp] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [activeMembersCount, setActiveMembersCount] = useState(0);

  const { loading, sendRequest } = useHttpClient();

  useEffect(() => {
    const fetchCounts = async () => {
      const response1 = await sendRequest("common/get-member-count");
      const response2 = await sendRequest("common/get-active-member-count");

      setMembersCount(response1.count);
      setActiveMembersCount(response2.count);
    };

    fetchCounts();
  }, []);

  const STATISTICS = [
    {
      countNum: 7,
      countTitle: "Cities, part of our network",
    },
    {
      countNum: 80,
      icon: "+",
      countTitle: "Events that we have hosted by today",
    },
    {
      countNum: loading || !membersCount ? <CustomSpinner /> : membersCount,
      countTitle: "Members, part of the society",
    },
    {
      countNum: 45,
      countTitle: "Active contributors to the society",
    },
    {
      countNum: 1600,
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
