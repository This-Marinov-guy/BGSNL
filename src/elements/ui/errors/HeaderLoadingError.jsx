import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Fade from "react-bootstrap/Fade";
import { useNavigate } from "@/util/navigation";
import HeaderTwo from "../../../component/header/HeaderTwo";

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
      <main className="ver_section mt--200" aria-busy={!isError}>
        <h3>{isError ? "Account unavailable" : "Loading your account"}</h3>
        {isError && message ? <p>{message}</p> : null}
        <Fade in={showBtns}>
          <div className="error-button mt--60">
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
      </main>
    </>
  );
};

HeaderLoadingError.propTypes = {
  isError: PropTypes.bool,
  message: PropTypes.string,
};

export default HeaderLoadingError;
