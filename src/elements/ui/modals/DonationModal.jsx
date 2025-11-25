import React from "react";
import { Dialog } from "primereact/dialog";
import { useSelector, useDispatch } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { DONATION_MODAL } from "../../../util/defines/common";
import { REGION_GO_FUND_ME } from "../../../util/defines/REGIONS_DESIGN";

const DonationModal = () => {
  const modal = useSelector(selectModal);
  const dispatch = useDispatch();

  const hideModal = () => {
    dispatch(removeModal(DONATION_MODAL));
  };

  return (
    <Dialog
      header="Support our mission"
      visible={modal.includes(DONATION_MODAL)}
      onHide={hideModal}
      style={{minHeight: "90vh"}}
      centered
    >
      <div className="donation-modal-content">
        <div className="center_div_col center_text">
          <p>
            Support our mission by donating via GoFundMe. Your contribution
            helps us keep the community thriving.
          </p>
        </div>
        <div
          style={{ position: "relative", paddingBottom: "170%", height: 0 }}
        >
          <iframe
            src={REGION_GO_FUND_ME.netherlands}
            title="GoFundMe"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allowFullScreen
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DonationModal;
