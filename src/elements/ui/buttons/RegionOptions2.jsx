import PropTypes from "prop-types";
import React from "react";
import Image from "next/image";
import { FiArrowRight } from "@/elements/ui/icons/IconlyIcons";
import { REGIONS } from "../../../util/defines/REGIONS_DESIGN";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";

const RegionOptions2 = ({ onSelectRegion }) => (
  <section className="signup-region-picker" aria-label="Choose a region">
    <div className="container">
      <div className="signup-region-grid">
        {REGIONS.map((region) => {
          const regionName = capitalizeFirstLetter(region, true);
          const imageExtension = region === "rotterdam" ? "jpg" : "webp";

          return (
            <button
              key={region}
              type="button"
              className="signup-region-card"
              aria-label={`Choose ${regionName}`}
              onClick={() => onSelectRegion(region)}
            >
              <Image
                src={`/assets/images/bg/paralax/${region}.${imageExtension}`}
                alt=""
                fill
                sizes="(max-width: 767px) calc(100vw - 70px), (max-width: 1199px) 33vw, 25vw"
              />
              <span className="signup-region-card__shade" aria-hidden="true" />
              <span className="signup-region-card__content">
                <strong>{regionName}</strong>
                <span className="signup-region-card__action" aria-hidden="true">
                  <FiArrowRight />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

RegionOptions2.propTypes = {
  onSelectRegion: PropTypes.func.isRequired,
};

export default RegionOptions2;
