import React, { Component, Fragment, useEffect, useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import ScrollAnimation from "react-animate-on-scroll";
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
      countNum: loading || !activeMembersCount ? <CustomSpinner /> : activeMembersCount,
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
      <div className="row mt--20">
        {STATISTICS.map((value, index) => (
          <div
            className="counterup_style--2 col-lg-3 col-md-6 col-6"
            key={index}
          >
            <ScrollAnimation
              animateIn="fadeInUp"
              animateOnce={true}
              delay={100}
            >
              <h5 className="counter">
                <VisibilitySensor
                  onChange={onVisibilityChange}
                  offset={{ top: 10 }}
                  delayedCall
                >
                  <CountUp end={didViewCountUp ? value.countNum : 0} />
                </VisibilitySensor>
              </h5>
              <h4 className="description">{value.countTitle}</h4>
            </ScrollAnimation>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default CounterOne;
