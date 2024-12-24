import React from "react";
import { Dialog } from "primereact/dialog";
import {
  LOCAL_STORAGE_COOKIE_CONSENT,
} from "../../../util/defines/common";

const CookiesModal = () => {
  const [visible, setVisible] = React.useState(
    localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT) !== "1" &&
      !window.location.pathname.includes("terms-and-legals")
  );

  return (
    <Dialog
      header="Cookie Consent"
      closable={false}
      visible={visible}
      className="bg-white d-flex justify-content-center align-items-center"
    >
      <p className="mt--10">
        In order to guarantee best performance, we need to make sure users have
        accepted the cookies of the website!
      </p>

      <div className="options-btns-div mt--60">
        <button
          onClick={() => {
            localStorage.setItem(LOCAL_STORAGE_COOKIE_CONSENT, "1");
            setVisible(false);
          }}
          className="rn-button-style--2 rn-btn-reverse-green"
        >
          Accept
        </button>
        <a
          href="/terms-and-legals#cookies"
          target="_blank"
          style={{ scale: "0.9" }}
          className="rn-button-style--2 rn-btn-green"
        >
          Policy
        </a>
      </div>
    </Dialog>
  );
};

export default CookiesModal;
