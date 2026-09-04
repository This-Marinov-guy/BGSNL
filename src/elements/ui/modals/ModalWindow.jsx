import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";

const ModalWindow = ({
  show,
  title = "Details",
  onHide,
  children,
  freeze = false,
  style,
}) => {
  // Was assigned during render, which crashes SSR.
  useEffect(() => {
    if (!freeze) return;

    window.onscroll = function () {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return () => {
      window.onscroll = null;
    };
  }, [freeze]);

  return (
    <Dialog
      header={title}
      visible={show}
      onHide={onHide}
      closable={Boolean(onHide)}
      dismissableMask={Boolean(onHide)}
      style={{ width: "900px", ...style }}
    >
      {children}
    </Dialog>
  );
};

ModalWindow.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.node,
  onHide: PropTypes.func,
  children: PropTypes.node,
  freeze: PropTypes.bool,
  style: PropTypes.object,
};

export default ModalWindow;
