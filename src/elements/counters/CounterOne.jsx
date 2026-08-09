import React, { Component, Fragment, useEffect, useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import { useHttpClient } from "../../hooks/common/http-hook";
import CustomSpinner from "../ui/loading/CustomSpinner";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";

// `initialData` comes from the server render (About fetches common/get-about-data),
// so the figures are in the HTML instead of behind spinners.
const CounterOne = ({ initialData = {} }) => {
  const [didViewCountUp, setDidViewCountUp] = useState(false);
  const [data, setData] = useState(initialData);

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
      countNum:
        (loading && !Object.keys(data).length) || !data.hasOwnProperty("cities") ? (
          <CustomSpinner />
        ) : (
          data?.cities
        ),
      countTitle: "Cities, part of our network",
    },
    {
      countNum:
        (loading && !Object.keys(data).length) || !data.hasOwnProperty("events") ? (
          <CustomSpinner />
        ) : (
          data?.events
        ),
      icon: "+",
      countTitle: "Events that we have hosted by today",
    },
    {
      countNum:
        (loading && !Object.keys(data).length) || !data.hasOwnProperty("members") ? (
          <CustomSpinner />
        ) : (
          data?.members
        ),
      countTitle: "Members, part of the society",
    },
    {
      countNum:
        (loading && !Object.keys(data).length) || !data.hasOwnProperty("alumnis") ? (
          <CustomSpinner />
        ) : (
          data?.alumnis
        ),
      countTitle: "Alumnis, supporters of the society",
    },
    // {
    //   countNum:
    //     (loading && !Object.keys(data).length) || !data.hasOwnProperty("activeMembers") ? (
    //       <CustomSpinner />
    //     ) : data?.activeMembers < 60 ? (
    //       65
    //     ) : (
    //       data?.activeMember
    //     ),
    //   countTitle: "Active contributors to the society",
    // },
    {
      countNum:
        (loading && !Object.keys(data).length) || !data.hasOwnProperty("tickets") ? (
          <CustomSpinner />
        ) : (
          data?.tickets
        ),
      icon: "+",
      countTitle: "Tickets sold",
    },
  ];

  const onVisibilityChange = (isVisible) => {
    if (isVisible) {
      setDidViewCountUp(true);
    }
  };

  /**
   * react-countup renders its start value (0) until the element scrolls into
   * view, so on the server every figure came out as "0". Rendering the real
   * number until mount puts the actual figures in the HTML for crawlers while
   * leaving the 0 -> N animation untouched: the swap to <CountUp> happens in an
   * effect, and for anything below the fold it happens off-screen.
   */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              {mounted ? (
                <VisibilitySensor
                  onChange={onVisibilityChange}
                  offset={{ top: 10 }}
                  delayedCall
                >
                  <CountUp end={didViewCountUp ? value.countNum : 0} />
                </VisibilitySensor>
              ) : (
                value.countNum
              )}
            </h5>
            <p className="description">{value.countTitle}</p>
          </div>
        ))}
      </div>
    </Fragment>
  );
};
export default CounterOne;
