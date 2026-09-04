import { SITE_NAME, SITE_SHORT_NAME } from "./site";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

export default function ShareImage({ eyebrow, title, description }) {
  const titleLength = Array.from(title || "").length;
  const titleSize = titleLength > 90 ? 52 : titleLength > 55 ? 62 : 74;

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
          zIndex: 1,
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
          }}
        >
          {SITE_SHORT_NAME}
        </span>
        <span>{eyebrow || SITE_NAME}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "960px",
          gap: "24px",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              maxWidth: "880px",
              lineHeight: 1.3,
              color: "#ded8e7",
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
          zIndex: 1,
        }}
      >
        bulgariansociety.nl
      </div>
    </div>
  );
}
