"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { IconlyShow } from "@/elements/ui/icons/IconlyIcons";

export const ImagePreviewOverlay = () => (
  <span aria-hidden="true" className="media-trigger__overlay">
    <span className="media-trigger__eye"><IconlyShow /></span>
  </span>
);

export default function ImagePreviewTrigger({ alt, children = <ImagePreviewOverlay />, className = "", imageClassName = "", src, ...buttonProps }) {
  const hostRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [frame, setFrame] = useState(null);

  const fitFrame = useCallback(() => {
    const host = hostRef.current;
    if (!host || !naturalSize) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;

    const ratio = naturalSize.width / naturalSize.height;
    const frameWidth = Math.min(width, height * ratio);
    const frameHeight = frameWidth / ratio;
    setFrame((current) => current?.width === frameWidth && current?.height === frameHeight ? current : { width: frameWidth, height: frameHeight });
  }, [naturalSize]);

  useEffect(() => {
    fitFrame();
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(fitFrame);
    observer.observe(host);
    return () => observer.disconnect();
  }, [fitFrame]);

  const onLoad = (event) => {
    const { naturalHeight, naturalWidth } = event.currentTarget;
    if (naturalWidth && naturalHeight) setNaturalSize({ width: naturalWidth, height: naturalHeight });
  };

  return <button {...buttonProps} ref={hostRef} className={`media-trigger ${className}`.trim()}>
    <span className="media-trigger__frame" style={frame ? { width: `${frame.width}px`, height: `${frame.height}px` } : undefined}>
      <img alt={alt} className={imageClassName} onLoad={onLoad} src={src} style={{ height: "auto", width: "100%" }} />
      {children}
    </span>
  </button>;
}

ImagePreviewTrigger.propTypes = {
  alt: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  src: PropTypes.string.isRequired,
};
