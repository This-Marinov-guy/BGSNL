import {
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@/compat/primereact";

const ImageSelection = ({
  options,
  initialValue,
  name,
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
      <div
        className="image-select-container rn-form-group"
        data-custom-validation-field
        data-field-name={name}
        ref={dropdownRef}
      >
        <input
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          name={name}
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

ImageSelection.propTypes = {
  initialValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
};

export default ImageSelection;
