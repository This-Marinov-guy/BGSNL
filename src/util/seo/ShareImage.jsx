import { SITE_NAME, SITE_SHORT_NAME } from "./site";
import PropTypes from "prop-types";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

export default function ShareImage({ eyebrow, title, description, imageSrc, imageFit = "cover" }) {
  const titleLength = Array.from(title || "").length;
  const titleSize = imageSrc
    ? (titleLength > 90 ? 42 : titleLength > 55 ? 50 : 62)
    : (titleLength > 90 ? 52 : titleLength > 55 ? 62 : 74);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "66px 72px",
        color: "#ffffff",
        background: "#15111f",
        fontFamily: "Arial, Helvetica, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: "360px",
          height: "360px",
          borderRadius: "180px",
          background: "#ef5b2a",
          right: "-120px",
          top: "-145px",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: "250px",
          height: "250px",
          border: "34px solid #fedc57",
          borderRadius: "125px",
          right: "100px",
          bottom: "-150px",
          opacity: 0.92,
        }}
      />
      <div
        style={{
          display: "flex",
        alignItems: "center",
        gap: "22px",
        letterSpacing: "0.03em",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "106px",
            height: "52px",
            borderRadius: "26px",
            background: "#ffffff",
            color: "#15111f",
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          {SITE_SHORT_NAME}
        </span>
        <span style={{ fontSize: "24px", fontWeight: 600 }}>{eyebrow || SITE_NAME}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: imageSrc ? "620px" : "960px",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            fontSize: `${titleSize}px`,
            fontWeight: 700,
          }}
        >
          {truncateTitle(title)}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              maxWidth: "880px",
              lineHeight: 1.3,
              color: "#ded8e7",
              fontSize: imageSrc ? "22px" : "26px",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          color: "#bdb4c9",
          fontSize: "19px",
        }}
      >
        bulgariansociety.nl
      </div>
      {imageSrc ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "64px",
            right: "64px",
            width: "420px",
            height: "502px",
            borderRadius: "20px",
            overflow: "hidden",
            background: "#30293a",
          }}
        >
          <img
            src={imageSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: imageFit }}
          />
        </div>
      ) : null}
    </div>
  );
}

function truncateTitle(value = "") {
  const characters = Array.from(value);
  return characters.length > 105 ? `${characters.slice(0, 104).join("").trimEnd()}…` : value;
}

ShareImage.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  imageSrc: PropTypes.string,
  imageFit: PropTypes.oneOf(["cover", "contain"]),
};
