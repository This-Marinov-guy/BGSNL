import PropTypes from "prop-types";
import { FieldArray, useFormikContext } from "formik";
import { OptionDate, OptionError, OptionField, OptionPanel, OptionSwitch } from "./EventOptionFields";
import EventPromoCodes from "./EventPromoCodes";
import EventRelatedPicker from "./EventRelatedPicker";

export default function EventUpsell({ currentEventId, active }) {
  const { values } = useFormikContext();
  return <div className="event-upsell">
    <div className="event-upsell-group"><div className="event-option-title"><h3>Early / late bird</h3></div>
      {[{ name: "earlyBird", title: "Early bird", description: "Offer an introductory price until a ticket count or deadline is reached.", date: "ticketTimer", dateLabel: "Ends at", limitLabel: "Number of early-bird tickets" },
        { name: "lateBird", title: "Late bird", description: "Set prices for the final stage of ticket sales.", date: "startTimer", dateLabel: "Starts at", limitLabel: "Ticket count cap (optional)" }].map(option =>
        <OptionPanel key={option.name} name={option.name} title={option.title} description={`${option.description} ${option.name === "earlyBird" ? "Set a ticket count, an end date, or both." : "A start date is required. Prices apply while the ticket count is below the cap, if set."}`}>
          <div className="event-option-grid">
            <OptionField name={`${option.name}.price`} label="Guest price (€) *" type="number" min={1} step="0.01" />
            <OptionField name={`${option.name}.memberPrice`} label="Member price (€) *" type="number" min={1} step="0.01" />
            <OptionField name={`${option.name}.ticketLimit`} label={option.limitLabel} type="number" min={1} step={1} />
            <OptionDate name={`${option.name}.${option.date}`} label={option.dateLabel} required={option.name === "lateBird"} />
          </div>
          <OptionError name={`${option.name}.at-least-one-limit`} />
          <OptionSwitch name={`${option.name}.excludeMembers`} label="Exclude member tickets from the count" />
        </OptionPanel>)}
    </div>
    <div className="event-upsell-group"><div className="event-option-title"><h3>Guest / member promotions</h3></div>
      {[{ name: "guestPromotion", title: "Guest promotion", description: "A timed discount for guest tickets." }, { name: "memberPromotion", title: "Member promotion", description: "A timed discount for member tickets." }].map(option =>
        <OptionPanel key={option.name} {...option} description={`${option.description} Deduct 5–95% from the applicable ticket price.`}>
          <div className="event-option-grid">
            <OptionField name={`${option.name}.discount`} label="Discount (%) *" type="number" min={5} max={95} step={1} placeholder="e.g., 15" />
            <OptionDate name={`${option.name}.startTimer`} label="Starts at" required />
            <OptionDate name={`${option.name}.endTimer`} label="Ends at" required />
          </div>
        </OptionPanel>)}
    </div>
    <EventPromoCodes />
    <OptionPanel name="addOns" title="Add-ons" description="Offer drinks, merchandise or other extras alongside the ticket.">
      <OptionField name="addOns.title" label="Heading shown at checkout *" placeholder="e.g., Make it a complete evening" />
      <div className="event-option-grid">
        <OptionSwitch name="addOns.multi" label="Allow multiple selections" />
        <OptionSwitch name="addOns.isMandatory" label="Require an add-on selection" />
      </div>
      <FieldArray name="addOns.items">{({ push, remove }) => <div className="event-option-items">
        <OptionError name="addOns.items" />
        {(values.addOns.items ?? []).map((item, index) => <div className="event-option-item" key={index}>
          <header><h4>{item.title?.trim() || `Item ${index + 1}`}</h4><button type="button" className="event-option-remove" disabled={values.addOns.items.length === 1} onClick={() => remove(index)} aria-label={`Remove add-on ${index + 1}`}>Remove</button></header>
          <div className="event-option-grid">
            <OptionField name={`addOns.items[${index}].title`} label="Item name *" placeholder="e.g., Welcome drink" />
            <OptionField name={`addOns.items[${index}].price`} label="Price (€)" type="number" min={0} step="0.01" placeholder="0.00" />
            <div className="event-option-wide"><OptionField name={`addOns.items[${index}].description`} label="Description (optional)" placeholder="What is included?" /></div>
          </div>
        </div>)}
        <button type="button" className="event-form-button event-form-button--ghost" onClick={() => push({ title: "", description: "", price: "" })}>+ Add item</button>
      </div>}</FieldArray>
    </OptionPanel>
    <EventRelatedPicker currentEventId={currentEventId} active={active} />
  </div>;
}
EventUpsell.propTypes = { currentEventId: PropTypes.string, active: PropTypes.bool };
