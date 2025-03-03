import React from "react";
import { useDispatch } from "react-redux";
import { changeLocalStorageIndex } from "../../redux/modal";

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
        className="ml-2 underline"
      >
        Visit
      </a>
    );
  } else if (strap?.links) {
    dynamicButton = (
      <a onClick={() => {}} className="ml-2 underline">
        Visit
      </a>
    );
  }

  return (
    <div className="nav-strap">
      {strap.title} {dynamicButton}
    </div>
  );
};

export default Strap;
