"use client";

import Image from "next/image";
import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./vladi-image.module.scss";

function LoadedVladiImage({ className = "", onLoad, onError, ...props }) {
  const [state, setState] = useState("loading");

  return <Image
    width={373}
    height={669}
    {...props}
    className={`${styles.image} ${className}`}
    data-vladi-image
    data-image-state={state}
    onLoad={(event) => {
      // Next Image calls onLoad after decoding, including cached images.
      if (event.currentTarget.naturalWidth > 0) setState("loaded");
      onLoad?.(event);
    }}
    onError={(event) => {
      setState("error");
      onError?.(event);
    }}
  />;
}

LoadedVladiImage.propTypes = {
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default function VladiImage({ src, alt = "", ...props }) {
  // Reset the load/reveal state when the report switches to another portrait.
  return <LoadedVladiImage key={src} src={src} alt={alt} {...props} />;
}

VladiImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
};
