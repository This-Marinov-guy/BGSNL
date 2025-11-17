import React, { useState, useEffect } from "react";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";
import { CalendarWithClock } from "../common/Calendar";

const PromoCodesBuilder = (props) => {
  const emptyPromoCode = {
    code: "",
    discountType: 2, // Default to percentage
    discount: undefined,
    useLimit: undefined,
    timeLimit: "",
    minAmount: undefined,
  };

  const [promoCodes, setPromoCodes] = useState(
    props.value && props.value.length > 0 ? props.value : [emptyPromoCode]
  );

  // Sync internal state with props
  useEffect(() => {
    if (props.value && props.value.length > 0) {
      setPromoCodes(props.value);
    }
  }, [props.value]);

  const addPromoCode = () => {
    const newPromoCodes = [...promoCodes, { ...emptyPromoCode }];
    setPromoCodes(newPromoCodes);
    props.onChange(newPromoCodes);
  };

  const removePromoCode = (index) => {
    if (promoCodes.length > 1) {
      const newPromoCodes = promoCodes.filter((_, i) => i !== index);
      setPromoCodes(newPromoCodes);
      props.onChange(newPromoCodes);
    }
  };

  const handlePromoCodeChange = (index, field, value) => {
    const newPromoCodes = promoCodes.map((promo, i) =>
      i === index ? { ...promo, [field]: value } : promo
    );
    setPromoCodes(newPromoCodes);
    props.onChange(newPromoCodes);
  };

  if (!props.isEnabled) {
    return null;
  }

  return (
    <div className="row">
      <div className="col-12 mt--20">
        <div className="row">
          {promoCodes.map((promoCode, index) => (
            <div
              key={index}
              className="col-lg-6 col-md-12 col-12 mb--30"
              style={{
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb--20">
                <h5 style={{ margin: 0 }}>Promo Code #{index + 1}</h5>
                {promoCode.id && (
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    ID: {promoCode.id}
                  </small>
                )}
              </div>

              {/* REQUIRED FIELDS */}
              <div style={{ marginBottom: "25px" }}>
                <h6
                  style={{
                    color: "#dc3545",
                    marginBottom: "15px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Required Fields
                </h6>

                {/* Promo Code */}
                <div className="rn-form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "5px",
                    }}
                  >
                    Code <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SUMMER2024"
                    value={promoCode.code}
                    onChange={(e) =>
                      handlePromoCodeChange(
                        index,
                        "code",
                        e.target.value.toUpperCase()
                      )
                    }
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                {/* Discount Type Radio */}
                <div className="rn-form-group mt--20">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      display: "block",
                      width: "8em",
                    }}
                  >
                    Discount Type <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <div className="d-flex" style={{ gap: "20px" }}>
                    <span
                      className="center_div"
                      style={{ cursor: "pointer", gap: "8px" }}
                    >
                      <input
                        type="radio"
                        name={`discountType-${index}`}
                        checked={promoCode.discountType === 1}
                        onChange={() =>
                          handlePromoCodeChange(index, "discountType", 1)
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "14px" }}>Fixed Amount (€)</span>
                    </span>
                    <span
                      className="center_div"
                      style={{ cursor: "pointer", gap: "8px" }}
                    >
                      <input
                        type="radio"
                        name={`discountType-${index}`}
                        checked={promoCode.discountType === 2}
                        onChange={() =>
                          handlePromoCodeChange(index, "discountType", 2)
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "14px" }}>Percentage (%)</span>
                    </span>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="rn-form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "5px",
                    }}
                  >
                    {promoCode.discountType === 2
                      ? "Discount %"
                      : "Discount Amount"}{" "}
                    <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder={
                      promoCode.discountType === 2 ? "e.g., 20" : "e.g., 10.00"
                    }
                    value={promoCode.discount || ""}
                    onChange={(e) =>
                      handlePromoCodeChange(
                        index,
                        "discount",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    min={promoCode.discountType === 2 ? 1 : 0.01}
                    max={promoCode.discountType === 2 ? 100 : undefined}
                    step="0.01"
                  />
                </div>
              </div>

              {/* OPTIONAL FIELDS */}
              <div
                style={{ paddingTop: "15px", borderTop: "1px dashed #dee2e6" }}
              >
                <h6
                  style={{
                    color: "#6c757d",
                    marginBottom: "15px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Optional Settings
                </h6>

                {/* Use Limit */}
                <div className="rn-form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "5px",
                      color: "#6c757d",
                    }}
                  >
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={promoCode.useLimit || ""}
                    onChange={(e) =>
                      handlePromoCodeChange(
                        index,
                        "useLimit",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    min={1}
                    step={1}
                  />
                </div>

                {/* Time Limit */}
                <div className="rn-form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "5px",
                      color: "#6c757d",
                    }}
                  >
                    Expiration Date
                  </label>
                  <CalendarWithClock
                    mode="single"
                    locale="en-nl"
                    placeholder="Select expiration"
                    captionLayout="dropdown"
                    min={new Date()}
                    initialValue={promoCode.timeLimit}
                    onSelect={(value) =>
                      handlePromoCodeChange(index, "timeLimit", value || "")
                    }
                  />
                </div>

                {/* Minimum Amount */}
                <div className="rn-form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "5px",
                      color: "#6c757d",
                    }}
                  >
                    Minimum Purchase (€)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50.00"
                    value={promoCode.minAmount || ""}
                    onChange={(e) =>
                      handlePromoCodeChange(
                        index,
                        "minAmount",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    min={0.01}
                    step="0.01"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="center_div mt--20">
                <XButton onClick={() => removePromoCode(index)} />
                <PlusButton onClick={addPromoCode} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCodesBuilder;
