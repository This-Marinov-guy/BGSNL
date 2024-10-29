import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { EUROPEAN_COUNTRIES } from "../../../util/defines/COUNTRIES";

const PhoneInput = ({ className, style, onChange, placeholder }) => {
  const [selectedCode, setSelectedCode] = useState(null);
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
