"use client";

import PropTypes from "prop-types";
import { useLayoutEffect, useRef, useState } from "react";

const TRANSITION_DURATION = 360;

const StepContentTransition = ({ children, direction, step }) => {
  const latestStepRef = useRef({ content: children, step });
  const incomingContentRef = useRef(children);
  const animationFrameRef = useRef(null);
  const completionTimerRef = useRef(null);
  const [leavingContent, setLeavingContent] = useState(null);
  const [animationState, setAnimationState] = useState(null);

  incomingContentRef.current = children;

  if (latestStepRef.current.step === step) {
    latestStepRef.current.content = children;
  }

  useLayoutEffect(() => {
    if (latestStepRef.current.step === step) return undefined;

    const outgoingContent = latestStepRef.current.content;
    latestStepRef.current = { content: incomingContentRef.current, step };
    setLeavingContent(outgoingContent);
    setAnimationState("staged");

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = requestAnimationFrame(() => {
        setAnimationState("running");
      });
    });

    completionTimerRef.current = window.setTimeout(() => {
      setLeavingContent(null);
      setAnimationState(null);
    }, TRANSITION_DURATION);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (completionTimerRef.current) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, [step]);

  const transitionClass = animationState
    ? `signup-step-transition__current is-${animationState}`
    : "signup-step-transition__current";

  return (
    <div
      className={`signup-step-transition${animationState ? " is-animating" : ""}`}
      data-direction={direction}
    >
      {leavingContent && (
        <div
          className={`signup-step-transition__leaving is-${animationState}`}
          aria-hidden="true"
        >
          {leavingContent}
        </div>
      )}
      <div className={transitionClass}>{children}</div>
    </div>
  );
};

StepContentTransition.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(["forward", "backward"]).isRequired,
  step: PropTypes.number.isRequired,
};

export default StepContentTransition;
