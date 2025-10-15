import React from "react";
import { useDispatch } from "react-redux";
import { changeLocalStorageIndex } from "../../redux/modal";
import { Link } from "react-router-dom";

const Strap = (props) => {
  const { strap } = props;

  const dispatch = useDispatch();

  if (!strap?.title) return null;

  let dynamicButton = null;

  if (strap?.modal) {
    dynamicButton = (
      <a
        onClick={() => {
          localStorage.removeItem("BGSNL_hide_" + strap.modal);
          dispatch(changeLocalStorageIndex());
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            localStorage.removeItem("BGSNL_hide_" + strap.modal);
            dispatch(changeLocalStorageIndex());
          }
        }}
        role="button"
        tabIndex={0}
        className="ml-2 underline"
        aria-label="Visit the page"
      >
        Visit
      </a>
    );
  } else if (strap?.link) {
    dynamicButton = (
      <a
        href={process.env.REACT_APP_PUBLIC_URL + strap?.link?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 underline"
      >
        {strap?.link?.name ?? "Visit"}
      </a>
    );
  }

  return (
    <div className="nav-strap" style={{ backgroundColor: strap?.color }}>
      {strap.title} {dynamicButton}
    </div>
  );
};

export default Strap;
