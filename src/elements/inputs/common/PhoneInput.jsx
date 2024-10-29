import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { EUROPEAN_COUNTRIES } from "../../../util/defines/COUNTRIES";
import { getGeoLocation } from "../../../util/functions/helpers";
import { LOCAL_STORAGE_LOCATION } from "../../../util/defines/common";

const PhoneInput = ({ className, style, onChange, placeholder }) => {
  const [selectedCode, setSelectedCode] = useState(
    EUROPEAN_COUNTRIES.find(
      (c) => c.iso2.toUpperCase() === getGeoLocation()
    )
  );

  const [value, setValue] = useState(undefined);

  useEffect(() => {
    if (onChange && selectedCode && value) {
      onChange(selectedCode.phoneCode + value);
    }
  }, [selectedCode, value]);

  return (
    <div className={"phone_code " + className} style={style}>
      <Dropdown
        value={selectedCode}
        filter
        onChange={(e) => {
          const inputValue = e.value;

          localStorage.setItem(
            LOCAL_STORAGE_LOCATION,
            EUROPEAN_COUNTRIES.find(
              (c) => c.phoneCode === inputValue.phoneCode
            )["iso2"]
          );

          setSelectedCode(inputValue);
        }}
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
