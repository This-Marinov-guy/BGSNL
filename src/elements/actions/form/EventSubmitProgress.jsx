import PropTypes from "prop-types";
import MultiStepLoader from "@/elements/ui/loaders/MultiStepLoader";

const LOADING_STATES = [
  { text: "Preparing your event" },
  { text: "Uploading some images, assembling the ticket" },
  { text: "Final touches" },
  { text: "Counting 3,2,1..." },
  { text: "Almost ready, I promise" },
];

export default function EventSubmitProgress({ loading, step = 0, preview = false, closable = false, onClose }) {
  const activeStep = Math.max(0, Math.min(step, LOADING_STATES.length - 1));
  return <MultiStepLoader loading={loading} loadingStates={LOADING_STATES} value={preview ? undefined : activeStep} loop={preview} duration={2000} closable={closable} onClose={onClose} className="event-submit-progress">
    <div className="event-submit-progress__visual" aria-hidden="true">
      <img className="event-submit-progress__gif" src="https://media1.tenor.com/images/fc8442a618ad1ef0485d894d64b2b077/tenor.gif" alt="" />
    </div>
  </MultiStepLoader>;
}
EventSubmitProgress.propTypes = { loading: PropTypes.bool.isRequired, step: PropTypes.number, preview: PropTypes.bool, closable: PropTypes.bool, onClose: PropTypes.func };
