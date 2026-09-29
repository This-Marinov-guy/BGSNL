"use client";

import PropTypes from "prop-types";
import { usePathname } from "next/navigation";
import HeaderTwo from "../../../component/header/HeaderTwo";
import ImageFb from "../media/ImageFb";
import LoadingRecovery from "../loading/LoadingRecovery";
import { LoadErrorBanner } from "../loading/LoadState";

const HeaderLoadingError = ({ isError = false, message = "" }) => {
  const pathname = usePathname();
  const isUserRoute = pathname === "/user" || pathname?.startsWith("/user/");

  return (
    <>
      <HeaderTwo />
      <main
        className={`account-state ${
          isError ? "account-state--error" : "account-state--loading"
        }`}
        aria-busy={!isError}
      >
        <div
          className="account-state__content"
        >
          {!isError ? (
            <ImageFb
              alt="Bulgarian Society Netherlands"
              className="account-state__logo"
              eager
              fallback="/assets/images/logo/logo.jpg"
              fetchPriority="high"
              src="/assets/images/logo/logo.webp"
            />
          ) : null}
          {isError ? <LoadErrorBanner onRetry={() => window.location.reload()} showHome>
            <h3>Account unavailable</h3>
            <p>{message || "We could not load your account. Please try again."}</p>
          </LoadErrorBanner> : <><h3 role="status">{isUserRoute ? "Loading your account" : "Loading"}</h3><LoadingRecovery /></>}
        </div>
      </main>
    </>
  );
};

HeaderLoadingError.propTypes = {
  isError: PropTypes.bool,
  message: PropTypes.string,
};

export default HeaderLoadingError;
