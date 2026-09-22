"use client";

import PropTypes from "prop-types";
import AnimatedDisclosure from "../../elements/ui/functional/AnimatedDisclosure";
import Header from "../header/Header";
import Footer from "../footer/Footer";

export default function RecoveryScreen({ kind = "not-found", error, onRetry }) {
  const failed = kind === "error";

  return (
    <div className="recovery-screen">
      <Header />
      <main className="recovery-content" aria-labelledby="recovery-title">
        <div className="recovery-title-row">
            {!failed && <img
              className="recovery-title-icon"
              src="/assets/images/avatars/no-event-found.png"
              alt=""
              aria-hidden="true"
            />}
          <h1 id="recovery-title" className="page-breadcrumb__title archive">{failed ? "Something went wrong." : "This page isn’t here."}</h1>
        </div>
        {failed && (
          <p className="recovery-description">
            We couldn’t load this page. Try again, or head back to the homepage.
          </p>
        )}
        <div className="recovery-actions">
          {failed ? (
            <>
              <button type="button" className="recovery-btn-primary" onClick={onRetry}>
                Try again
              </button>
              <a className="recovery-btn-secondary" href="/">Back to home</a>
            </>
          ) : (
            <>
              <a className="recovery-btn-primary" href="/">Back to home</a>
              <a className="recovery-btn-secondary" href="/events/future-events">Explore events</a>
            </>
          )}
        </div>
        {failed && process.env.NODE_ENV !== "production" && error?.message && (
          <AnimatedDisclosure className="recovery-details" summary="Error details (development only)">
            <pre>{error.message}</pre>
          </AnimatedDisclosure>
        )}
      </main>
      <Footer />
    </div>
  );
}

RecoveryScreen.propTypes = {
  kind: PropTypes.oneOf(["not-found", "error"]),
  error: PropTypes.shape({ message: PropTypes.string }),
  onRetry: PropTypes.func,
};
