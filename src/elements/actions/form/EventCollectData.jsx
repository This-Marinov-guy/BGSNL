import { useId, useRef } from "react";
import { FieldArray, useFormikContext } from "formik";
import { SelectInput } from "@/compat/primereact";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconlyPlus } from "@/elements/ui/icons/IconlyIcons";
import { OptionError, OptionField, OptionSwitch } from "./EventOptionFields";

export default function EventCollectData() {
  const { values, setFieldValue } = useFormikContext();
  const id = useId();
  const questionKeys = useRef([]);
  const nextQuestionKey = useRef(0);
  const reducedMotion = useReducedMotion();
  const questions = values.extraInputsForm ?? [];
  const questionKey = (index) => {
    if (!questionKeys.current[index]) {
      nextQuestionKey.current += 1;
      questionKeys.current[index] = `${id}-${nextQuestionKey.current}`;
    }
    return questionKeys.current[index];
  };
  return <section className="event-collect-data" aria-labelledby={`${id}-title`}>
    <header><h3 id={`${id}-title`}>Collect data</h3><p>Ask guests for the details you need when they get a ticket. All questions are optional unless marked required.</p></header>
    <FieldArray name="extraInputsForm">{({ push, remove }) => <div className="event-option-items">
      <OptionError name="extraInputsForm" />
      {!questions.length && <p className="event-option-help">No extra questions added.</p>}
      <AnimatePresence initial={false}>
      {questions.map((question, index) => {
        const prefix = `extraInputsForm[${index}]`;
        const typeId = `${id}-${index}-type`;
        return <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="event-option-item"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          key={questionKey(index)}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
        >
          <header><h4>Question {index + 1}</h4><button className="event-option-remove" type="button" onClick={() => { questionKeys.current.splice(index, 1); remove(index); }} aria-label={`Remove question ${index + 1}`}>Remove</button></header>
          <div className="event-option-grid">
            <OptionField name={`${prefix}.placeholder`} label="Question *" placeholder="e.g., Do you have any dietary requirements?" maxLength={200} />
            <div className="rn-form-group" data-custom-validation-field data-field-name={`${prefix}.type`}>
              <label htmlFor={typeId}>Answer type *</label>
              <SelectInput id={typeId} name={`${prefix}.type`} value={question.type} onChange={event => setFieldValue(`${prefix}.type`, event.target.value)}>
                <option value="" disabled>Choose an answer type</option><option value="text">Written answer</option><option value="select">Choose from options</option>
              </SelectInput><OptionError name={`${prefix}.type`} />
            </div>
            <OptionSwitch className="event-option-grid__switch" name={`${prefix}.required`} label="Answer required" />
            {question.type === "select" && <OptionSwitch className="event-option-grid__switch" name={`${prefix}.multiselect`} label="Allow multiple answers" />}
          </div>
          {question.type === "select" && <div className="event-question-options">
            <FieldArray name={`${prefix}.options`}>{({ push: addOption, remove: removeOption }) => <>
              <h4>Answer options</h4><OptionError name={`${prefix}.options`} />
              {(question.options ?? []).map((option, optionIndex) => <div className="event-question-option" key={optionIndex}>
                <OptionField name={`${prefix}.options[${optionIndex}]`} label={`Option ${optionIndex + 1} *`} />
                <button className="event-option-remove" type="button" onClick={() => removeOption(optionIndex)} aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`}>Remove</button>
              </div>)}
              <button type="button" className="event-form-button event-form-button--ghost" disabled={(question.options?.length ?? 0) >= 100} onClick={() => addOption("")}><IconlyPlus aria-hidden className="event-form-button__icon" size={18} />Add option</button>
            </>}</FieldArray>
          </div>}
        </motion.div>;
      })}
      </AnimatePresence>
      <button type="button" className="event-form-button event-form-button--outline-green event-collect-data__add-question" disabled={questions.length >= 50} onClick={() => { nextQuestionKey.current += 1; questionKeys.current.push(`${id}-${nextQuestionKey.current}`); push({ type: "text", placeholder: "", required: false, multiselect: false, options: [] }); }}><IconlyPlus aria-hidden className="event-form-button__icon" size={18} />Add question</button>
    </div>}</FieldArray>
  </section>;
}
