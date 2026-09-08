import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Fade from "react-bootstrap/Fade";
import { useNavigate } from "@/util/navigation";
import HeaderTwo from "../../../component/header/HeaderTwo";
import ImageFb from "../media/ImageFb";

const HeaderLoadingError = ({ isError = false, message = "" }) => {
  const navigate = useNavigate();
  const [showBtns, setShowBtns] = useState(isError);

  useEffect(() => {
    if (isError) {
      setShowBtns(true);
      return undefined;
    }

    const timer = window.setTimeout(() => setShowBtns(true), 5000);
    return () => window.clearTimeout(timer);
  }, [isError]);

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
          role={isError ? "alert" : "status"}
          aria-live={isError ? "assertive" : "polite"}
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
          <h3>{isError ? "Account unavailable" : "Loading your account"}</h3>
          {isError && message ? <p>{message}</p> : null}
          <Fade in={showBtns}>
            <div className="error-button account-state__actions">
              {!isError ? (
                <h4>
                  This is taking longer than expected. You can retry or return
                  to the previous page.
                </h4>
              ) : null}
              <div className="options-btns-div">
                <button
                  onClick={() => window.location.reload()}
                  className="rn-button-style--2 rn-btn-reverse-green"
                  type="button"
                >
                  Try again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="rn-button-style--2 rn-btn-reverse"
                  type="button"
                >
                  Go back
                </button>
              </div>
            </div>
          </Fade>
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
