import PropTypes from "prop-types";
import { IconlyEdit } from "@/elements/ui/icons/IconlyIcons";

export default function EventPanelEditButton({ title, onEdit }) {
  if (!onEdit) return null;
  return (
    <button type="button" className="event-details-modal__panel-edit" onClick={onEdit}
      aria-label={`Edit ${title.toLowerCase()}`} title={`Edit ${title.toLowerCase()}`}>
      <IconlyEdit size={18} aria-hidden="true" />
    </button>
  );
}

EventPanelEditButton.propTypes = { title: PropTypes.string.isRequired, onEdit: PropTypes.func };
