"use client";

import PropTypes from "prop-types";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "./CometCard.module.scss";

const SPRING = { stiffness: 180, damping: 24, mass: 0.6 };

export default function CometCard({ children, rotateDepth = 17.5, translateDepth = 20 }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, SPRING);
  const springY = useSpring(pointerY, SPRING);

  const rotateX = useTransform(springY, [-0.5, 0.5], [-rotateDepth, rotateDepth]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [rotateDepth, -rotateDepth]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-translateDepth, translateDepth]);
  const translateY = useTransform(springY, [-0.5, 0.5], [translateDepth, -translateDepth]);
  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.88) 8%, rgba(255, 255, 255, 0.52) 22%, rgba(255, 255, 255, 0) 72%)`;

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const trackPointer = (event) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const movement = reduceMotion
    ? undefined
    : { rotateX, rotateY, x: translateX, y: translateY };

  return (
    <div className={styles.perspective}>
      <motion.div
        className={styles.surface}
        onPointerMove={trackPointer}
        onPointerLeave={reset}
        style={movement}
        whileHover={reduceMotion ? undefined : { scale: 1.035, z: 42 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            className={styles.glare}
            style={{ background: glare }}
          />
        )}
      </motion.div>
    </div>
  );
}

CometCard.propTypes = {
  children: PropTypes.node.isRequired,
  rotateDepth: PropTypes.number,
  translateDepth: PropTypes.number,
};
