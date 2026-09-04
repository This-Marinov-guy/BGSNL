import React, { useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import { useSelector } from "react-redux";
import { Dialog } from "@/compat/primereact";
import { selectWarning } from "../../../redux/modal";

const Update = () => {
  const warning = useSelector(selectWarning);

  // Was assigned during render, which crashes SSR.
  useEffect(() => {
    window.onscroll = function () {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return () => {
      window.onscroll = null;
    };
  }, []);

  return (
    <Dialog
      header="Version update"
      visible={warning}
      closable={false}
      style={{ width: "520px" }}
    >
      <Alert className="error_panel" variant="info">
        <p className="mb--0">
          The website is being updated. Please close it or refresh the page.
        </p>
      </Alert>
    </Dialog>
  );
};

export default Update;
