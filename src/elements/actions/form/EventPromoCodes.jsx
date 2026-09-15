import { useId } from "react";
import { Field, FieldArray, useFormikContext } from "formik";
import { SelectInput } from "@/compat/primereact";
import { OptionDate, OptionError, OptionField, OptionPanel, OptionSwitch } from "./EventOptionFields";
import { normalizePromoCode, promoAudiences } from "@/util/functions/event-promo-codes.mjs";

export default function EventPromoCodes() {
  const { values, setFieldValue } = useFormikContext();
  const id = useId();
  const codes = values.promoCodes?.codes ?? [];
  return <OptionPanel name="promoCodes" title="Promo codes" description="Let buyers enter a code in Stripe Checkout to get a discount on this event’s tickets.">
    <FieldArray name="promoCodes.codes">{({ push, remove }) => <div className="event-option-items">
      <OptionError name="promoCodes.codes" />
      {codes.map((code, index) => {
        const prefix = `promoCodes.codes[${index}]`;
        const locked = Boolean(code.id);
        return <div className="event-option-item" key={code.id || index}>
          <header><div className="event-option-title"><h4>{code.code || `Code ${index + 1}`}</h4></div><button type="button" className="event-option-remove" onClick={() => remove(index)} aria-label={`Remove promo code ${index + 1}`}>Remove</button></header>
          <div className="event-option-grid">
            <OptionField name={`${prefix}.code`} label="Promo code *" placeholder="e.g., WELCOME20" maxLength={100} autoCapitalize="characters" autoComplete="off" />
            <div className="rn-form-group" data-custom-validation-field data-field-name={`${prefix}.discountType`}>
              <label htmlFor={`${id}-${index}-type`}>Discount type *</label>
              <SelectInput id={`${id}-${index}-type`} name={`${prefix}.discountType`} value={code.discountType} disabled={locked} onChange={event => setFieldValue(`${prefix}.discountType`, Number(event.target.value))}>
                <option value={2}>Percentage off (%)</option><option value={1}>Fixed amount off (€)</option>
              </SelectInput><OptionError name={`${prefix}.discountType`} />
            </div>
            <OptionField name={`${prefix}.discount`} label={Number(code.discountType) === 1 ? "Amount off (€) *" : "Percentage off (%) *"} type="number" min="0.01" max={Number(code.discountType) === 2 ? 100 : undefined} step="0.01" disabled={locked} />
            <OptionField name={`${prefix}.useLimit`} label="Maximum redemptions (optional)" type="number" min={1} step={1} placeholder="Unlimited" disabled={locked} />
            {locked ? <OptionField name={`${prefix}.timeLimit`} label="Expiration" disabled /> : <div><OptionDate name={`${prefix}.timeLimit`} label="Expires at (optional)" />{code.timeLimit && <button type="button" className="event-option-remove" onClick={() => setFieldValue(`${prefix}.timeLimit`, "")}>Remove expiration</button>}</div>}
          </div>
          <fieldset className="event-promo-audiences" data-custom-validation-field data-field-name={`${prefix}.audiences`}>
            <legend>Who can use this code?</legend>
            <div>{promoAudiences.map(audience => <label key={audience.value}><Field type="checkbox" name={`${prefix}.audiences`} value={audience.value} /><span>{audience.label}</span></label>)}</div>
            <OptionError name={`${prefix}.audiences`} />
          </fieldset>
          <OptionSwitch name={`${prefix}.active`} label="Code active" />
        </div>;
      })}
      <button type="button" className="event-form-button event-form-button--ghost" disabled={codes.length >= 100} onClick={() => push(normalizePromoCode())}>+ Add promo code</button>
    </div>}</FieldArray>
  </OptionPanel>;
}
