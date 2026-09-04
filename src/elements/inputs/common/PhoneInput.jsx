import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Dropdown, InputNumber } from "@/compat/primereact";
import { LOCAL_STORAGE_LOCATION } from "../../../util/defines/common";
import { EUROPEAN_COUNTRIES } from "../../../util/defines/COUNTRIES";
import { getGeoLocation } from "../../../util/functions/helpers";

const COUNTRIES_BY_PHONE_CODE_LENGTH = [...EUROPEAN_COUNTRIES].sort(
  (first, second) => second.phoneCode.length - first.phoneCode.length
);

const PhoneInput = ({
  className = "",
  style = {},
  onChange,
  placeholder,
  initialValue,
  name,
}) => {
  const normalizedInitialValue = String(initialValue ?? "").trim();
  const initialCountry = COUNTRIES_BY_PHONE_CODE_LENGTH.find((country) =>
    normalizedInitialValue.startsWith(country.phoneCode)
  );
  const initialPrefix = initialCountry?.phoneCode ?? "";
  const initialNumber = (
    initialPrefix
      ? normalizedInitialValue.slice(initialPrefix.length)
      : normalizedInitialValue
  ).replace(/\D/g, "");

  const [selectedCode, setSelectedCode] = useState(
    initialCountry
      ? initialCountry
      : EUROPEAN_COUNTRIES.find((c) => c.iso2 === getGeoLocation()) ??
          EUROPEAN_COUNTRIES.find((c) => c.iso2 === "NL")
  );

  useEffect(() => {
    if (!initialPrefix || selectedCode?.phoneCode === initialPrefix) return;

    const matchingCountry = EUROPEAN_COUNTRIES.find(
      (country) => country.phoneCode === initialPrefix
    );
    if (matchingCountry) setSelectedCode(matchingCountry);
  }, [initialPrefix, selectedCode?.phoneCode]);

  const updatePhoneNumber = (nextNumber, country = selectedCode) => {
    if (!onChange) return;

    onChange(
      country && nextNumber !== null && nextNumber !== undefined && nextNumber !== ""
        ? `${country.phoneCode} ${nextNumber}`
        : ""
    );
  };

  return (
    <div
      className={"phone_code " + className}
      role="group"
      aria-label="Phone number"
      data-field-name={name}
      style={style}
    >
      <Dropdown
        value={selectedCode}
        filter
        ariaLabel="Country calling code"
        filterPlaceholder="Search"
        onChange={(e) => {
          const inputValue = e.value;

          localStorage.setItem(
            LOCAL_STORAGE_LOCATION,
            EUROPEAN_COUNTRIES.find(
              (c) => c.phoneCode === inputValue.phoneCode
            )["iso2"]
          );

          setSelectedCode(inputValue);
          updatePhoneNumber(initialNumber, inputValue);
        }}
        options={EUROPEAN_COUNTRIES}
        optionKey="iso2"
        optionLabel="phoneCode"
        placeholder="Country code"
        className="phone_code_prefix"
        appendTo={typeof document !== "undefined" ? document.body : undefined}
        panelClassName="phone-prefix-panel"
      />
      <InputNumber
        name={name}
        value={initialNumber === "" ? null : Number(initialNumber)}
        useGrouping={false}
        onValueChange={(e) => updatePhoneNumber(e.target.value)}
        className="phone_code_content"
        inputClassName="bgsnl-form-control"
        placeholder={placeholder ?? "Phone Number"}
      />
    </div>
  );
};

export default PhoneInput;

PhoneInput.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  name: PropTypes.string,
};
