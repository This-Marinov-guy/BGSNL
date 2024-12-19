import React from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { FiSearch } from "react-icons/fi";

const SearchField = (props) => {
  const { placeholder = "Search", onChange, ...otherProps } = props;

  return (
    <div {...otherProps}>
      <IconField iconPosition="left">
        <InputIcon>
          <FiSearch style={{ fontSize: "0.8em" }} />
        </InputIcon>
        <InputText
          name="search"
          style={{ paddingLeft: "2.5em" }}
          placeholder={placeholder}
          onChange={onChange}
        />
      </IconField>
    </div>
  );
};

export default SearchField;
