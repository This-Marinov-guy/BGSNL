"use client";

import React, { useCallback, useState } from "react";
import GlobalBackground from "@/component/common/GlobalBackground";
import ImageFb from "../media/ImageFb";
import LoadingRecovery from "./LoadingRecovery";

const PageLoading = () => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const handleCanvasReady = useCallback(() => setIsCanvasReady(true), []);

  return (
    <div
      className={`page-loading ${isCanvasReady ? "is-canvas-ready" : ""}`}
    >
      <GlobalBackground initiallyRevealed onReady={handleCanvasReady} />
      <div className="page-loading__content">
        <ImageFb
          alt="Bulgarian Society Netherlands"
          className="page-loading__logo"
          eager
          fallback="/assets/images/logo/logo.jpg"
          fetchPriority="high"
          src="/assets/images/logo/logo.webp"
        />
        <h3 role="status" aria-live="polite">Loading...</h3>
        <LoadingRecovery />
      </div>
    </div>
  );
};

export default PageLoading;
