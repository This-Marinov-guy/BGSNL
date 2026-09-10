import PropTypes from "prop-types";
import HeaderTwo from "../../../component/header/HeaderTwo";
import ImageFb from "../media/ImageFb";
import LoadingRecovery, { LoadingRecoveryActions } from "../loading/LoadingRecovery";

const HeaderLoadingError = ({ isError = false, message = "" }) => {
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
          role={isError ? "alert" : undefined}
          aria-live={isError ? "assertive" : undefined}
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
          <h3 role={isError ? undefined : "status"}>{isError ? "Account unavailable" : "Loading your account"}</h3>
          {isError && message ? <p>{message}</p> : null}
          {isError ? <LoadingRecoveryActions /> : <LoadingRecovery />}
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
