import React, { useEffect, useState } from "react";
import { CAMPAIGNS } from "../util/defines/CAMPAIGNS";
import { Dialog } from "primereact/dialog";
import ImageFb from "../elements/ui/media/ImageFb";
import { Link } from "react-router-dom";

const CampaignLayout = ({ children }) => {
  const [openModals, setOpenModals] = useState({});

  // Load campaign visibility from localStorage after component mounts
  useEffect(() => {
    const storedModals = CAMPAIGNS.reduce((acc, campaign) => {
      const isHidden =
        localStorage.getItem("BGSNL_hide_" + campaign.key) === "1";
      if (campaign?.modal.active && !isHidden) {
        acc[campaign.key] = true;
      }
      return acc;
    }, {});

    setOpenModals(storedModals);
  }, []);

  const closeModal = (key) => {
    setOpenModals((prev) => ({ ...prev, [key]: false }));
    localStorage.setItem("BGSNL_hide_" + key, "1");
  };

  return (
    <>
      {children}

      {/* Render modals for active campaigns */}
      {CAMPAIGNS.map((campaign) =>
        campaign.modal.active ? (
          <Dialog
            key={campaign.key}
            header={campaign.modal.title}
            visible={openModals[campaign.key]}
            onHide={() => closeModal(campaign.key)}
            style={{ maxWidth: "80vw", overflowY: 'auto' }}
            dismissableMask
          >
            {campaign.modal.images[0] && (
              <ImageFb
                style={{ margin: "10px auto", height: "12em" }}
                className="center_div"
                src={campaign.modal.images[0]}
                fallback="/assets/images/logo/logo.jpg"
                alt="Campaign Image"
              />
            )}
            <p style={{ whiteSpace: "pre-line" }} className="mt--10">
              {campaign.modal.description}
            </p>
            {campaign.modal.images[1] && (
              <ImageFb
                style={{ margin: "10px auto", height: "12em" }}
                className="center_div"
                src={campaign.modal.images[1]}
                fallback="/assets/images/logo/logo.jpg"
                alt="Campaign Image"
              />
            )}

            {campaign.modal.links.length > 0 && (
              <div className="row d-flex justify-content-center g--4 mt--20">
                {campaign.modal.links.map((link, i) =>
                  link.isExternal ? (
                    <a
                      key={i}
                      target="_blank"
                      href={link.href}
                      rel="noreferrer"
                      className={`center_text rn-button-style--2 rn-btn-solid-green`}
                    >
                      {" "}
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={i}
                      to={link.href}
                      className={`center_text rn-button-style--2 rn-btn-solid-green`}
                    >
                      {link.name}
                    </Link>
                  )
                )}
              </div>
            )}
          </Dialog>
        ) : null
      )}
    </>
  );
};

export default CampaignLayout;
