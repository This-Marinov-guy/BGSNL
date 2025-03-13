import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CAMPAIGNS } from "../../util/defines/CAMPAIGNS";

const CampaignBanner = (props) => {
  const { campaignKey, border = 1 } = props;
  const location = useLocation();
  const routePath = location.pathname;

  const campaign = CAMPAIGNS.find(
    (c) => c.key === (campaignKey ?? "")
  );  

  if (!campaign || !campaign?.banner?.active || !campaign?.banner) {
    return null;
  }

  return (
    <div
      className={`team_member_border_${border} center_section`}
      style={{ margin: "mb--20 auto" }}
    >
      <p className="center_text">{campaign.banner.description}</p>

      {campaign.banner.links.length > 0 && (
        <div className="row d-flex justify-content-center g--4 mt--20">
          {campaign.banner.links.map((link, i) =>
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
    </div>
  );
};

export default CampaignBanner;
