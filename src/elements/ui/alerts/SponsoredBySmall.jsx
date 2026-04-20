import React from "react";
import ImageFb from "../media/ImageFb";

const SponsoredBySmall = () => {
  return (
    <div className="mb--20 mt--20 ver_section_sm d-flex flex-column items-center justify-center">
      <h3 style={{ fontWeight: "100", marginTop: "10px" }} className="archive">
        With the help of
      </h3>
      <div
        style={{ backgroundColor: "transparent", margin: "0", padding: "0" }}
        className="rn-brand-area brand-separation"
      >
        <ImageFb
          style={{ maxHeight: "2em", margin: "2px" }}
          src="/assets/images/brand/trans-brand-07.png"
          alt="small-logo"
        />
        <ImageFb
          style={{ maxHeight: "2em", margin: "2px" }}
          src="/assets/images/brand/brand-02.png"
          alt="small-logo"
        />
        <ImageFb
          style={{ maxHeight: "2em", margin: "2px" }}
          src="/assets/images/brand/brand-04.png"
          alt="small-logo"
        />
      </div>
    </div>
  );
};

export default SponsoredBySmall;
