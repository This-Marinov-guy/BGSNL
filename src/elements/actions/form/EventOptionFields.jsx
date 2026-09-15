import InfoHint from "../../ui/icons/InfoHint";
import { useId } from "react";
import { ErrorMessage, Field, useField, useFormikContext } from "formik";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { CalendarWithClock } from "../../inputs/common/Calendar";

export function OptionError({ name }) {
  return <ErrorMessage name={name}>{message => typeof message === "string" ? <div className="error" data-validation-message-for={name}>{message}</div> : null}</ErrorMessage>;
}
OptionError.propTypes = { name: PropTypes.string.isRequired };

export function OptionField({ name, label, type = "text", ...props }) {
  const id = useId();
  return <div className="rn-form-group" data-custom-validation-field data-field-name={name}>
    <label htmlFor={id}>{label}</label><Field id={id} name={name} type={type} {...props} /><OptionError name={name} />
  </div>;
}
OptionField.propTypes = { name: PropTypes.string.isRequired, label: PropTypes.string.isRequired, type: PropTypes.string };

export function OptionDate({ name, label, required = false }) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  return <div className="rn-form-group" data-custom-validation-field data-field-name={name}>
    <label>{label}{required ? " *" : ""}</label>
    <CalendarWithClock name={name} mode="single" locale="en-nl" placeholder={label} captionLayout="dropdown" initialValue={field.value} onSelect={value => setFieldValue(name, value)} />
    <OptionError name={name} />
  </div>;
}
OptionDate.propTypes = { name: PropTypes.string.isRequired, label: PropTypes.string.isRequired, required: PropTypes.bool };

export function OptionSwitch({ name, label }) {
  const id = useId();
  const [field, , helpers] = useField(name);
  const checked = field.value === true || field.value === "true";
  return <div className="event-ticket-switch-row">
    <label htmlFor={id}>{label}</label>
    <button id={id} name={name} type="button" role="switch" aria-checked={checked} className="event-ticket-switch" onClick={() => helpers.setValue(!checked, false)}><span aria-hidden="true" /></button>
  </div>;
}
OptionSwitch.propTypes = { name: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

function Reveal({ children, id }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div id={id} className="event-option-reveal" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }} inert={!present || undefined} aria-hidden={!present || undefined}>
    <div className="event-option-body">{children}</div>
  </motion.div>;
}
Reveal.propTypes = { children: PropTypes.node, id: PropTypes.string };

export function OptionPanel({ name, title, description, children }) {
  const id = useId();
  const [field, , helpers] = useField(`${name}.isEnabled`);
  const enabled = field.value === true;
  return <section className={`event-option-panel${enabled ? " is-enabled" : ""}`} aria-labelledby={`${id}-title`}>
    <header className="event-option-header"><div className="event-option-title"><h3 id={`${id}-title`}>{title}</h3>{description && <InfoHint label={`About ${title.toLowerCase()}`} text={description} />}</div>
      <button type="button" role="switch" className="event-ticket-switch" aria-label={`Enable ${title.toLowerCase()}`} aria-checked={enabled} aria-expanded={enabled} aria-controls={`${id}-body`} onClick={() => helpers.setValue(!enabled, false)}><span aria-hidden="true" /></button>
    </header>
    <AnimatePresence initial={false}>{enabled && <Reveal id={`${id}-body`}>{children}</Reveal>}</AnimatePresence>
  </section>;
}
OptionPanel.propTypes = { name: PropTypes.string.isRequired, title: PropTypes.string.isRequired, description: PropTypes.string, children: PropTypes.node };
