import React, { useState, useEffect, useRef } from "react";

const StickyButtonFooter = ({ children, showOnMobile = true }) => {
  const [isSticky, setIsSticky] = useState(false);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    if (!showOnMobile) return;

    const handleScroll = () => {
      if (!buttonContainerRef.current) return;

      const rect = buttonContainerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if we're on mobile (viewport width <= 768px)
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Show sticky footer when buttons are below viewport
        // Hide sticky footer when user has scrolled to the actual buttons
        setIsSticky(rect.top > viewportHeight - 100);
      } else {
        setIsSticky(false);
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [showOnMobile]);

  return (
    <>
      {/* Original button container */}
      <div ref={buttonContainerRef} className="button-container-original">
        {children}
      </div>

      {/* Sticky footer (only visible on mobile when appropriate) */}
      {isSticky && (
        <div className="sticky-button-footer">
          <div className="sticky-button-footer-content">{children}</div>
        </div>
      )}
    </>
  );
};

export default StickyButtonFooter;

