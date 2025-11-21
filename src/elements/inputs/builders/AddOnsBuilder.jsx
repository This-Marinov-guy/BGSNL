import React, { useState, useEffect } from "react";
import { ErrorMessage } from "formik";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";
import ToggleSwitch from "../../ui/ToggleSwitch";

const AddOnsBuilder = (props) => {
  const emptyInputObj = {
    isEnabled: false,
    multi: false,
    isMandatory: false,
    title: "",
    items: [{ title: "", description: "", price: undefined }],
  };

  const [input, setInput] = useState(props.value ?? emptyInputObj);

  // Sync internal state with props
  useEffect(() => {
    setInput(props.value ?? emptyInputObj);
  }, [props.value]);

  const addItem = () => {
    const newInput = {
      ...input,
      items: [...input.items, { title: "", description: "", price: undefined }],
    };
    setInput(newInput);
    props.onChange(newInput);
  };

  const removeItem = (itemIndex) => {
    if (input.items.length > 1) {
      const newInput = {
        ...input,
        items: input.items.filter((_, index) => index !== itemIndex),
      };
      setInput(newInput);
      props.onChange(newInput);
    }
  };

  const handleItemChange = (itemIndex, field, value) => {
    const newInput = {
      ...input,
      items: input.items.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    };
    setInput(newInput);
    props.onChange(newInput);
  };

  const handleValueChange = (name, value) => {
    const newInput = {
      ...input,
      [name]: value,
    };
    setInput(newInput);
    props.onChange(newInput);
  };

  if (!props.value.isEnabled) {
    return null;
  }

  return (
    <div className="row">
      <div className="col-12 mt--20">
        <div className="row g-3 mb--20">
          {/* Main Title */}
          <div className="col-lg-6 col-md-12">
            <div className="rn-form-group">
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "5px",
                }}
              >
                Main Title <span style={{ color: "#dc3545" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Extra Options"
                onChange={(e) => handleValueChange("title", e.target.value)}
                value={input.title}
              />
              <ErrorMessage
                className="error"
                name="addOns.title"
                component="div"
              />
            </div>
          </div>

          {/* Multi Selection */}
          <div className="col-lg-3 col-6">
            <div className="rn-form-group">
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "5px",
                  color: "#6c757d",
                }}
              >
                Multiple Selection
              </label>
              <ToggleSwitch
                checked={input.multi}
                onChange={(e) => handleValueChange("multi", e.target.checked)}
                activeLabel="Yes"
                inactiveLabel="No"
              />
            </div>
          </div>

          {/* Mandatory Toggle */}
          <div className="col-lg-3 col-6">
            <div className="rn-form-group">
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "5px",
                  color: "#6c757d",
                }}
              >
                Mandatory
              </label>
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", marginTop: "8px" }}
              >
                <ToggleSwitch
                  checked={input.isMandatory}
                  onChange={(e) =>
                    handleValueChange("isMandatory", e.target.checked)
                  }
                  activeLabel="Yes"
                  inactiveLabel="No"
                />
              </div>
            </div>
          </div>
        </div>

        <ErrorMessage
          className="error center_text"
          name="addOns.items"
          component="div"
        />
        <h5 className="mt--20 mb--20" style={{ color: "#6c757d" }}>
          Add-On Items
        </h5>
        <div className="row mt--10 mb--10">
          {input.items.map((item, itemIndex) => (
            <div
              className="col-lg-4 col-md-6 col-12 mb--30"
              key={itemIndex}
              style={{
                padding: "15px",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <h6 style={{ marginBottom: "15px", color: "#017363" }}>
                Item #{itemIndex + 1}
              </h6>

              <div className="rn-form-group">
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "5px",
                  }}
                >
                  Title <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Extra Drink"
                  value={item.title}
                  onChange={(e) =>
                    handleItemChange(itemIndex, "title", e.target.value)
                  }
                />
                <ErrorMessage
                  className="error"
                  name={`addOns.items[${itemIndex}].title`}
                  component="div"
                />
              </div>

              <div className="rn-form-group">
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "5px",
                    color: "#6c757d",
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., One additional beverage"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(itemIndex, "description", e.target.value)
                  }
                />
                <ErrorMessage
                  className="error"
                  name={`addOns.items[${itemIndex}].description`}
                  component="div"
                />
              </div>

              <div className="rn-form-group">
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "5px",
                    color: "#6c757d",
                  }}
                >
                  Price (€)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5.00"
                  value={item.price || ""}
                  onChange={(e) =>
                    handleItemChange(itemIndex, "price", e.target.value)
                  }
                  min={0}
                  step="0.01"
                />
                <ErrorMessage
                  className="error"
                  name={`addOns.items[${itemIndex}].price`}
                  component="div"
                />
              </div>

              <div className="mt--10 center_div">
                <XButton onClick={() => removeItem(itemIndex)} />
                <PlusButton onClick={addItem} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddOnsBuilder;
