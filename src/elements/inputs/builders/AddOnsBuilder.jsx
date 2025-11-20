import React, { useState, useEffect } from "react";
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
        <div className="d-flex justify-content-around align-items-center g--5 mb--20">
          <input
            type="text"
            placeholder="Main Title"
            onChange={(e) => handleValueChange("title", e.target.value)}
            value={input.title}
          />
          <select
            value={input.multi}
            onChange={(e) =>
              handleValueChange("multi", e.target.value === "true")
            }
          >
            <option disabled value="">
              Add multiple add-ons?
            </option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <div className="d-flex align-items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#6c757d" }}>
              Mandatory:
            </span>
            <ToggleSwitch
              checked={input.isMandatory}
              onChange={(e) => handleValueChange("isMandatory", e.target.checked)}
              activeLabel="Yes"
              inactiveLabel="No"
            />
          </div>
        </div>
        <div className="row mt--10 mb--10">
          {input.items.map((item, itemIndex) => (
            <div className="center_div_col col-4 mb--10" key={itemIndex}>
              <input
                type="text"
                placeholder="Title"
                value={item.title}
                onChange={(e) =>
                  handleItemChange(itemIndex, "title", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(itemIndex, "description", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price || ""}
                onChange={(e) =>
                  handleItemChange(itemIndex, "price", e.target.value)
                }
              />
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
