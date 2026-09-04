"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";

const noop = () => {};

const getTicketClosingState = (targetTime) => {
  const target = moment(targetTime);

  if (!target.isValid()) {
    return { hasLotsOfTime: false, remainingTime: null };
  }

  const now = moment();

  return {
    hasLotsOfTime: target.isAfter(now.clone().add(3, "months")),
    remainingTime: Math.max(target.diff(now), 0),
  };
};

const formatClosingCountdown = (remainingTime) => {
  const totalSeconds = Math.floor(remainingTime / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
};

const TicketClosingCountdown = ({
  isClosed = false,
  onClose = noop,
  targetTime,
}) => {
  const [closingState, setClosingState] = useState(null);

  useEffect(() => {
    if (isClosed) {
      return undefined;
    }

    const updateClosingState = () => {
      const nextState = getTicketClosingState(targetTime);
      setClosingState(nextState);

      if (nextState.remainingTime === 0) {
        onClose(true);
      }

      return nextState;
    };

    const initialState = updateClosingState();

    if (initialState.remainingTime === null || initialState.remainingTime === 0) {
      return undefined;
    }

    const timer = globalThis.setInterval(updateClosingState, 1000);

    return () => globalThis.clearInterval(timer);
  }, [isClosed, onClose, targetTime]);

  if (isClosed || closingState?.remainingTime === 0) {
    return (
      <strong className="event-detail-countdown">Ticket sales are closed</strong>
    );
  }

  if (!closingState) {
    return <strong className="event-detail-countdown">Calculating…</strong>;
  }

  if (closingState.remainingTime === null) {
    return (
      <strong className="event-detail-countdown">
        Closing time unavailable
      </strong>
    );
  }

  if (closingState.hasLotsOfTime) {
    return (
      <strong className="event-detail-countdown is-roomy">
        You have a lot of time…
      </strong>
    );
  }

  return (
    <strong className="event-detail-countdown">
      <time dateTime={moment(targetTime).toISOString()}>
        {formatClosingCountdown(closingState.remainingTime)}
      </time>
    </strong>
  );
};

TicketClosingCountdown.propTypes = {
  isClosed: PropTypes.bool,
  onClose: PropTypes.func,
  targetTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
};

export default TicketClosingCountdown;
