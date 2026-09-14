"use client";

import { useId, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

const ImageGallery = dynamic(() => import("./media/ImageGallery"), { ssr: false });

const EventImageCarousel = ({ images, title = "Event" }) => {
  const [order, setOrder] = useState(() => images.map((_, index) => index));
  const [previewOpen, setPreviewOpen] = useState(false);
  const groupId = useId();
  const reduceMotion = useReducedMotion();
  const mainIndex = order[0];
  const transition = { duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] };

  const swapImage = (slot) => {
    setOrder((current) => {
      const next = [...current];
      [next[0], next[slot]] = [next[slot], next[0]];
      return next;
    });
  };

  const image = (index, main = false) => (
    <motion.img
      key={index}
      layoutId={`event-image-${index}`}
      initial={false}
      transition={transition}
      src={images[index]}
      alt={`${title} image ${index + 1}`}
      className={main ? "carousel-main-image" : "carousel-thumbnail-image"}
      loading={main ? "eager" : "lazy"}
      fetchPriority={main && index === 0 ? "high" : "auto"}
      draggable={false}
    />
  );

  if (!images.length) return null;

  return <>
    <LayoutGroup id={groupId}>
      <div className="event-carousel-container">
        <div className="event-carousel-main">
          <button type="button" className="carousel-image-wrapper" onClick={() => setPreviewOpen(true)} aria-label={`Preview ${title} image ${mainIndex + 1}`}>
            {image(mainIndex, true)}
          </button>
        </div>
        {order.length > 1 && <div className="event-carousel-thumbnails" role="group" aria-label="Choose the main event image">
          {order.slice(1).map((index, slot) => (
            <button key={slot} type="button" className="carousel-thumbnail" onClick={() => swapImage(slot + 1)} aria-label={`Show ${title} image ${index + 1} as main image`}>
              {image(index)}
            </button>
          ))}
        </div>}
        <span className="visually-hidden" aria-live="polite" aria-atomic="true">Showing image {mainIndex + 1} of {images.length}</span>
      </div>
    </LayoutGroup>
    {previewOpen && <ImageGallery
      images={images.map((src, index) => ({ src, alt: `${title} image ${index + 1}` }))}
      src={images[mainIndex]}
      alt={`${title} image ${mainIndex + 1}`}
      fileName={`${title}-image-${mainIndex + 1}`}
      open
      onClose={() => setPreviewOpen(false)}
    />}
  </>;
};

EventImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};

export default EventImageCarousel;
