import PropTypes from "prop-types";
import { InputText } from "@/compat/primereact";
import { FiSearch } from "@/elements/ui/icons/IconlyIcons";

const SearchField = ({
  ariaLabel = "Search",
  className = "",
  inputClassName = "",
  name = "search",
  onChange,
  placeholder = "Search",
  value,
  ...otherProps
}) => {

  return (
    <div className={`search-field ${className}`.trim()} {...otherProps}>
      <FiSearch className="search-field-icon" size={18} />
      <InputText
        aria-label={ariaLabel}
        className={`form-control search-field-input ${inputClassName}`.trim()}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

SearchField.propTypes = {
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SearchField;
