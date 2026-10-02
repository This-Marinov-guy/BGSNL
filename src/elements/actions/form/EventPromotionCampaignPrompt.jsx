import PropTypes from "prop-types";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
export default function EventPromotionCampaignPrompt({ checked, onChange }) {
  return <div className="event-details-modal__notice" role="status"><FiInfo aria-hidden="true" /><div>
    <strong>Let people know about this offer?</strong>
    <p>You added an offer or lowered a ticket price. Review a promotion email after saving; nothing is sent without confirmation.</p>
    <label><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /> Review promotion email after saving</label>
  </div></div>;
}
EventPromotionCampaignPrompt.propTypes = { checked: PropTypes.bool.isRequired, onChange: PropTypes.func.isRequired };
