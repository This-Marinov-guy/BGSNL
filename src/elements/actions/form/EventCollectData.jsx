import { useId } from "react";
import { FieldArray, useFormikContext } from "formik";
import { SelectInput } from "@/compat/primereact";
import { OptionError, OptionField, OptionSwitch } from "./EventOptionFields";

export default function EventCollectData() {
  const { values, setFieldValue } = useFormikContext();
  const id = useId();
  const questions = values.extraInputsForm ?? [];
  return <section className="event-collect-data" aria-labelledby={`${id}-title`}>
    <header><h3 id={`${id}-title`}>Collect data</h3><p>Ask guests for the details you need when they get a ticket. All questions are optional unless marked required.</p></header>
    <FieldArray name="extraInputsForm">{({ push, remove }) => <div className="event-option-items">
      <OptionError name="extraInputsForm" />
      {!questions.length && <p className="event-option-help">No extra questions added.</p>}
      {questions.map((question, index) => {
        const prefix = `extraInputsForm[${index}]`;
        const typeId = `${id}-${index}-type`;
        return <div className="event-option-item" key={index}>
          <header><h4>Question {index + 1}</h4><button className="event-option-remove" type="button" onClick={() => remove(index)} aria-label={`Remove question ${index + 1}`}>Remove</button></header>
          <div className="event-option-grid">
            <OptionField name={`${prefix}.placeholder`} label="Question *" placeholder="e.g., Do you have any dietary requirements?" maxLength={200} />
            <div className="rn-form-group" data-custom-validation-field data-field-name={`${prefix}.type`}>
              <label htmlFor={typeId}>Answer type *</label>
              <SelectInput id={typeId} name={`${prefix}.type`} value={question.type} onChange={event => setFieldValue(`${prefix}.type`, event.target.value)}>
                <option value="" disabled>Choose an answer type</option><option value="text">Written answer</option><option value="select">Choose from options</option>
              </SelectInput><OptionError name={`${prefix}.type`} />
            </div>
            <OptionSwitch name={`${prefix}.required`} label="Answer required" />
            {question.type === "select" && <OptionSwitch name={`${prefix}.multiselect`} label="Allow multiple answers" />}
          </div>
          {question.type === "select" && <div className="event-question-options">
            <FieldArray name={`${prefix}.options`}>{({ push: addOption, remove: removeOption }) => <>
              <h4>Answer options</h4><OptionError name={`${prefix}.options`} />
              {(question.options ?? []).map((option, optionIndex) => <div className="event-question-option" key={optionIndex}>
                <OptionField name={`${prefix}.options[${optionIndex}]`} label={`Option ${optionIndex + 1} *`} />
                <button className="event-option-remove" type="button" onClick={() => removeOption(optionIndex)} aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`}>Remove</button>
              </div>)}
              <button type="button" className="event-form-button event-form-button--ghost" disabled={(question.options?.length ?? 0) >= 100} onClick={() => addOption("")}>+ Add option</button>
            </>}</FieldArray>
          </div>}
        </div>;
      })}
      <button type="button" className="event-form-button event-form-button--ghost" disabled={questions.length >= 50} onClick={() => push({ type: "text", placeholder: "", required: false, multiselect: false, options: [] })}>+ Add question</button>
    </div>}</FieldArray>
  </section>;
}
