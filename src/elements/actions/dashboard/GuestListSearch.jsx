import PropTypes from "prop-types";
import { IconlySearch } from "@/elements/ui/icons/IconlyIcons";

export default function GuestListSearch({ value, onChange }) {
  return <div className="guest-list__search-field">
    <IconlySearch aria-hidden="true" />
    <input
    className="guest-list__search"
    type="search"
    aria-label="Search guests by name, email, phone, or transaction ID"
    placeholder="Search"
    value={value}
    onChange={event => onChange(event.target.value)}
    />
  </div>;
}

GuestListSearch.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };
