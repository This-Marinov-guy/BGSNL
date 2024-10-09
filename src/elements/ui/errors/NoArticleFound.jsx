import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderTwo from "../../../component/header/HeaderTwo";
import ImageFb from "../media/ImageFb";

const NoArticleFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderTwo />
      <div className="ver_section mt--200">
        <ImageFb
          className="logo-md logo-rounded"
          src="/assets/images/avatars/empty.jpg"
          alt="No Article"
        />
        <div className="error-button center_text mt--60">
          <h4>Bummer...No such article was found after so much searching!</h4>
          <div className="options-btns-div ">
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="rn-button-style--2 rn-btn-reverse-green"
            >
              Try again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rn-button-style--2 rn-btn-reverse"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoArticleFound;
