import React from "react";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ImageFb = ({
  alt = "Fallback image",
  className,
  eager = false,
  fallback,
  fetchPriority,
  loading,
  src,
  style,
  type = "image/webp",
  visibleByDefault = false,
  ...props
}) => {
  return (
    <picture>
      <source srcSet={src} type={type} />
      <LazyLoadImage
        {...props}
        alt={alt}
        className={className}
        fetchPriority={fetchPriority}
        loading={eager ? "eager" : loading}
        src={fallback ?? src}
        style={style}
        visibleByDefault={eager || visibleByDefault}
      />
    </picture>
  );
};

ImageFb.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  eager: PropTypes.bool,
  fallback: PropTypes.string,
  fetchPriority: PropTypes.string,
  loading: PropTypes.string,
  src: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.string,
  visibleByDefault: PropTypes.bool,
};

export default ImageFb;
