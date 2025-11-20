import React from "react";

const ToggleSwitch = ({
  checked,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  showLabel = true,
}) => {
  return (
    <div className="d-flex align-items-center" style={{ gap: "8px" }}>
      {showLabel && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: checked ? "#28a745" : "#dc3545",
          }}
        >
          {checked ? activeLabel : inactiveLabel}
        </span>
      )}
      <label
        style={{
          position: "relative",
          display: "inline-block",
          width: "44px",
          height: "24px",
          margin: 0,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? "#28a745" : "#ccc",
            transition: "0.4s",
            borderRadius: "24px",
          }}
        >
          <span
            style={{
              position: "absolute",
              content: "",
              height: "18px",
              width: "18px",
              left: checked ? "23px" : "3px",
              bottom: "3px",
              backgroundColor: "white",
              transition: "0.4s",
              borderRadius: "50%",
            }}
          />
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;

