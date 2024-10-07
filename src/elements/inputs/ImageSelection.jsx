import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "primereact/tooltip";

const ImageSelection = ({
  options,
  initialValue,
  onSelect,
  placeholder = "Select an image",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(initialValue);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <>
      {selectedOption && (
        <Tooltip
          target=".image-select-container"
          position="top"
          style={{ maxWidth: "200px" }}
        >
          <img
            src={`/assets/images/bg/bg-image-${selectedOption}.webp`}
            alt="bg preview"
          />
        </Tooltip>
      )}
      <div className="image-select-container rn-form-group" ref={dropdownRef}>
        <input
          onClick={handleToggleDropdown}
          placeholder={placeholder}
          value={selectedOption || ""}
          readOnly
        />
        {isOpen && (
          <div className="image-select-dropdown">
            {options.map((option, index) => (
              <div key={index} className="image-option">
                <img
                  src={option.src}
                  alt={option.value}
                  onClick={() => handleSelectOption(option.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageSelection;
