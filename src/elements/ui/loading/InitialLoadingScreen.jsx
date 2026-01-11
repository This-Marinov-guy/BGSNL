import React, { useState, useEffect } from "react";
import ImageFb from "../media/ImageFb";

const InitialLoadingScreen = ({ onLoadComplete, isReady }) => {
  const [isFading, setIsFading] = useState(false);
  const [minDisplayTime, setMinDisplayTime] = useState(true);

  // Ensure logo is visible for at least 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDisplayTime(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Start fade-out when app is ready and minimum display time has passed
  useEffect(() => {
    if (isReady && !minDisplayTime && !isFading) {
      // Additional small delay to ensure main content is rendered
      const renderDelay = setTimeout(() => {
        setIsFading(true);
        // Call onLoadComplete after fade-out animation completes
        if (onLoadComplete) {
          const timer = setTimeout(() => {
            onLoadComplete();
          }, 500); // Match CSS transition duration
          return () => clearTimeout(timer);
        }
      }, 200); // Give main content time to render
      
      return () => clearTimeout(renderDelay);
    }
  }, [isReady, minDisplayTime, isFading, onLoadComplete]);

  return (
    <div className={`initial-loading-screen ${isFading ? "fade-out" : "fade-in"}`}>
      <div className="initial-loading-content">
        <ImageFb
          className="initial-loading-logo"
          src="/assets/images/logo/logo.webp"
          fallback="/assets/images/logo/logo.jpg"
          alt="Bulgarian Society Netherlands Logo"
        />
      </div>
    </div>
  );
};

export default InitialLoadingScreen;
