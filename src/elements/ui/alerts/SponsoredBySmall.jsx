import React from "react";
import ImageFb from "../media/ImageFb";

const SponsoredBySmall = () => {
  return (
    <div className="mb--20 hor_section_sm">
      <h3 style={{ fontWeight: "100" }} className="archive">
        With the help of
      </h3>
      <div
        style={{ backgroundColor: "transparent", margin: '0', padding: '0'}}
        className="rn-brand-area brand-separation"
      >
        <ImageFb
          style={{ height: "1.5em", margin: "2px" }}
          src="/assets/images/brand/brand-07.png"
          alt="small-logo"
        />
        <ImageFb
          style={{ height: "1.5em", margin: "2px" }}
          src="/assets/images/brand/brand-02.png"
          alt="small-logo"
        />
        <ImageFb
          style={{ height: "1.5em", margin: '2px' }}
          src="/assets/images/brand/brand-04.png"
          alt="small-logo"
        />
      </div>
    </div>
  );
};

export default SponsoredBySmall;
