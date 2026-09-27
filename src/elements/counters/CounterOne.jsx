import React, { Fragment, useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import PropTypes from "prop-types";
import { useHttpClient } from "../../hooks/common/http-hook";
import CustomSpinner from "../ui/loading/CustomSpinner";

// `initialData` comes from the server render (About fetches common/get-about-data),
// so the figures are in the HTML instead of behind spinners.
const CounterOne = ({ initialData = {} }) => {
  const [didViewCountUp, setDidViewCountUp] = useState(false);
  const [data, setData] = useState(initialData);
  const counterRef = useRef(null);

  const { sendRequest } = useHttpClient();
  const [pending, setPending] = useState(false);
  const hasStat = (key) => Object.prototype.hasOwnProperty.call(data, key);

  useEffect(() => {
    const fetchCounts = async () => {
      setPending(true);
      try {
        const response = await sendRequest("common/get-about-data", "GET", null, {}, false, false, { timeout: 5000 });

        if (response) setData(response);
      } catch {
        // Keep the server-rendered figures when a background refresh fails.
      } finally {
        setPending(false);
      }
    };

    fetchCounts();
  }, []);

  const stat = key => hasStat(key) ? data[key] : pending ? <CustomSpinner /> : <span aria-label="Temporarily unavailable">—</span>;

  const STATISTICS = [
    {
      countNum: stat("cities"),
      countTitle: "Cities in our network",
    },
    {
      countNum: stat("events"),
      icon: "+",
      countTitle: "Events hosted so far",
    },
    {
      countNum: stat("members"),
      countTitle: "Members in our society",
    },
    {
      countNum: stat("alumnis"),
      countTitle: "Alumni supporting our community",
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
      countNum: stat("tickets"),
      icon: "+",
      countTitle: "Tickets sold",
    },
  ];

  useEffect(() => {
    const counterElement = counterRef.current;

    if (!counterElement) return undefined;

    if (!("IntersectionObserver" in window)) {
      setDidViewCountUp(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDidViewCountUp(true);
          observer.disconnect();
        }
      },
      { rootMargin: "10px 0px" },
    );

    observer.observe(counterElement);

    return () => observer.disconnect();
  }, []);

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
      <div ref={counterRef} className="about-summary__grid">
        {STATISTICS.map((value) => {
          const isNumericCount =
            typeof value.countNum === "number" ||
            (typeof value.countNum === "string" &&
              Number.isFinite(Number(value.countNum)));

          return (
            <article className="counterup_style--1" key={value.countTitle}>
              <p className="description">{value.countTitle}</p>
              <h5 className="counter">
                {isNumericCount && value.icon}
                {mounted && isNumericCount ? (
                  <CountUp
                    end={didViewCountUp ? Number(value.countNum) : 0}
                  />
                ) : (
                  value.countNum
                )}
              </h5>
            </article>
          );
        })}
      </div>
    </Fragment>
  );
};

CounterOne.propTypes = {
  initialData: PropTypes.object,
};

export default CounterOne;
