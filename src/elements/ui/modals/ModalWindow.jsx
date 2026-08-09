import React, { useEffect } from "react";
import Modal from "react-bootstrap/Modal";

const ModalWindow = (props) => {
  // Was assigned during render, which crashes SSR.
  useEffect(() => {
    if (!props.freeze) return;

    window.onscroll = function () {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return () => {
      window.onscroll = null;
    };
  }, [props.freeze]);

  return (
    <Modal
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      enforceFocus={false}
      freeze={props.freeze}
    >
      {props.children}
    </Modal>
  );
};

export default ModalWindow;
