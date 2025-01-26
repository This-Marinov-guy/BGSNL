import React, { useState } from "react";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";

const AddOnsBuilder = (props) => {
  const emptyInputObj = {
    title: "",
    multi: false,
    items: [{ title: "", description: "", price: undefined }],
  };
  const [input, setInput] = useState(props.value ?? emptyInputObj);

  const addItem = () => {
    setInput((prevInput) => ({
      ...prevInput,
      items: [...prevInput.items, { title: "", description: "", price: undefined }],
    }));
    props.onChange(input);
  };

  const removeItem = (itemIndex) => {
    if (input.items.length > 1) {
      setInput((prevInput) => ({
        ...prevInput,
        items: prevInput.items.filter((_, index) => index !== itemIndex),
      }));
      props.onChange(input);
    }
  };

  const handleItemChange = (itemIndex, field, value) => {
    setInput((prevInput) => ({
      ...prevInput,
      items: prevInput.items.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    }));
    props.onChange(input);
  };

  const handleValueChange = (name, value) => {
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
    props.onChange(input);
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
              handleValueChange('multi', e.target.value)
            }
          >
            <option disabled value="">
              Add multiple add-ons?
            </option>
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
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
                value={item.price}
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
