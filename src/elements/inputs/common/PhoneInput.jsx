import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { EUROPEAN_COUNTRIES } from "../../../util/defines/COUNTRIES";
import { getGeoLocation } from "../../../util/functions/helpers";
import { LOCAL_STORAGE_LOCATION } from "../../../util/defines/common";

const PhoneInput = ({ className, style, onChange, placeholder }) => {
  const location = localStorage.getItem(LOCAL_STORAGE_LOCATION);

  const [selectedCode, setSelectedCode] = useState(
    location
      ? EUROPEAN_COUNTRIES.find((c) => c.iso2.toUpperCase() === location)
      : getGeoLocation()
  );
  
  const [value, setValue] = useState(undefined);

  useEffect(() => {
    if (onChange && selectedCode && value) {
      onChange(selectedCode + value);
    }
  }, [selectedCode, value]);

  return (
    <div className={"phone_code " + className} style={style}>
      <Dropdown
        value={selectedCode}
        filter
        onChange={(e) => setSelectedCode(e.value)}
        options={EUROPEAN_COUNTRIES}
        optionLabel="phoneCode"
        placeholder="Prefix"
        className="phone_code_prefix"
      />
      <InputNumber
        value={value}
        useGrouping={false}
        onValueChange={(e) => setValue(e.target.value)}
        className="phone_code_content"
        placeholder={placeholder ?? "Phone Number"}
      />
    </div>
  );
};

export default PhoneInput;
