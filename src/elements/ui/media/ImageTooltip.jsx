"use client";

import { cloneElement, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import styles from "./image-gallery.module.scss";

export default function ImageTooltip({ label, children }) {
  const id = useId();
  const [position, setPosition] = useState(null);
  const hide = () => setPosition(null);
  const show = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({ left: Math.max(110, Math.min(window.innerWidth - 110, rect.left + rect.width / 2)), top: rect.top - 8 });
  };

  useEffect(() => {
    if (!position) return undefined;
    const dismiss = () => setPosition(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [position]);

  return <>
    {cloneElement(children, {
      title: undefined,
      "aria-describedby": position ? id : undefined,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      onKeyDown: (event) => { if (event.key === "Escape") hide(); children.props.onKeyDown?.(event); },
      onClick: (event) => { hide(); children.props.onClick?.(event); },
    })}
    {position && createPortal(<span id={id} role="tooltip" className={styles.tooltip} style={position}>{label}</span>, document.body)}
  </>;
}

ImageTooltip.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.element.isRequired };
