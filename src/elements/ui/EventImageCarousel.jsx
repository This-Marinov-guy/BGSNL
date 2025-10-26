import React, { useState } from "react";
import ImageFb from "./media/ImageFb";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const EventImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const handlePreviewPrevious = () => {
    setPreviewIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handlePreviewNext = () => {
    setPreviewIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="event-carousel-container">
        {/* Main Carousel */}
        <div className="event-carousel-main">
          <div className="carousel-image-wrapper" onClick={() => openPreview(activeIndex)}>
            <ImageFb
              src={images[activeIndex]}
              alt={`Event image ${activeIndex + 1}`}
              className="carousel-main-image"
            />
            <div className="carousel-overlay">
              <span className="carousel-preview-text">Click to preview</span>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <FiChevronLeft />
              </button>
              <button
                className="carousel-btn carousel-btn-next"
                onClick={handleNext}
                aria-label="Next image"
              >
                <FiChevronRight />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="event-carousel-thumbnails">
            {images.map((image, index) => (
              <div
                key={index}
                className={`carousel-thumbnail ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <ImageFb src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Preview Modal */}
      {previewOpen && (
        <div className="event-preview-modal" onClick={closePreview}>
          <button className="preview-close" onClick={closePreview}>
            <FiX />
          </button>

          <div
            className="preview-content"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageFb
              src={images[previewIndex]}
              alt={`Preview ${previewIndex + 1}`}
              className="preview-image"
            />

            {images.length > 1 && (
              <>
                <button
                  className="preview-btn preview-btn-prev"
                  onClick={handlePreviewPrevious}
                >
                  <FiChevronLeft />
                </button>
                <button
                  className="preview-btn preview-btn-next"
                  onClick={handlePreviewNext}
                >
                  <FiChevronRight />
                </button>
                <div className="preview-counter">
                  {previewIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EventImageCarousel;

