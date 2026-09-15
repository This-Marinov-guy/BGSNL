import { useId, useState } from "react";
import { ErrorMessage, Field, useField, useFormikContext } from "formik";
import PropTypes from "prop-types";
import StepContentTransition from "../../ui/functional/StepContentTransition";
import InfoHint from "../../ui/icons/InfoHint";
import ImageInput from "../../inputs/common/ImageInput";
import { CalendarWithClock } from "../../inputs/common/Calendar";

const TICKET_TYPES = [
  { value: "paid", label: "Paid tickets", description: "Set a price for each audience." },
  { value: "members-free", label: "Free for members", description: "Guests pay; members enter for free." },
  { value: "free", label: "Free for everyone", description: "No entry charge for any guest." },
  { value: "external", label: "External ticket platform", description: "Send guests to another ticket website." },
];

const PriceField = ({ name, label, required = false, placeholder }) => {
  const id = useId();
  const [field] = useField(name);
  return (
    <div className="rn-form-group event-ticket-price-field">
      <label htmlFor={id}>{label}{required && <span className="event-ticket-required"> *</span>}</label>
      <input {...field} value={field.value ?? ""} id={id} type="number" min={1} step="0.01" placeholder={placeholder} />
      <ErrorMessage className="error" name={name} component="div" />
    </div>
  );
};
PriceField.propTypes = { name: PropTypes.string.isRequired, label: PropTypes.string.isRequired, required: PropTypes.bool, placeholder: PropTypes.string };

const IncludedField = ({ name, label }) => {
  const id = useId();
  return (
    <div className="rn-form-group">
      <label htmlFor={id}>{label}</label>
      <Field id={id} name={name} placeholder="e.g., a welcome drink" />
      <ErrorMessage className="error" name={name} component="div" />
    </div>
  );
};
IncludedField.propTypes = { name: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

const TicketSwitch = ({ name, label, onValue, offValue, onLabel, offLabel }) => {
  const id = useId();
  const [field, , helpers] = useField(name);
  const checked = field.value === onValue;
  return (
    <div className="event-ticket-switch-row">
      <label htmlFor={id}>{label}</label>
      <div className="event-ticket-switch-row__control">
        <span id={`${id}-state`}>{checked ? onLabel : offLabel}</span>
        <button
          id={id}
          name={name}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={`${id}-state`}
          className="event-ticket-switch"
          onClick={() => helpers.setValue(checked ? offValue : onValue, false)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
TicketSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onValue: PropTypes.string.isRequired,
  offValue: PropTypes.string.isRequired,
  onLabel: PropTypes.string.isRequired,
  offLabel: PropTypes.string.isRequired,
};

export default function EventTicketsMedia({ children }) {
  const { values, setValues, setFieldValue } = useFormikContext();
  const id = useId();
  const ticketType = values.isFree ? "free" : values.isTicketLink ? "external" : values.isMemberFree ? "members-free" : "paid";
  const [pricingDirection, setPricingDirection] = useState("forward");
  const ticketTypeIndex = TICKET_TYPES.findIndex(({ value }) => value === ticketType);
  const hasPrices = ticketType === "paid" || ticketType === "members-free";

  const selectTicketType = (type) => {
    if (type === ticketType) return;
    setPricingDirection(TICKET_TYPES.findIndex(({ value }) => value === type) > ticketTypeIndex ? "forward" : "backward");
    // Keep entered prices when switching modes; the existing flags determine
    // which prices apply when the event is saved and tickets are purchased.
    setValues((previous) => ({
      ...previous,
      isFree: type === "free",
      isMemberFree: type === "members-free",
      isTicketLink: type === "external",
    }), false);
  };

  return (
    <div className="event-tickets-media">
      <fieldset className="event-ticket-types">
        <legend>How will guests get tickets?</legend>
        <div className="event-ticket-types__options">
          {TICKET_TYPES.map(({ value, label, description }) => (
            <label key={value} className={`event-ticket-type${ticketType === value ? " is-selected" : ""}`}>
              <input type="radio" name={`${id}-ticket-type`} value={value} checked={ticketType === value} onChange={() => selectTicketType(value)} />
              <span><strong>{label}</strong><small>{description}</small></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="event-ticket-pricing-transition">
        <StepContentTransition step={ticketTypeIndex} direction={pricingDirection}>
      {hasPrices && (
        <section className="event-ticket-prices" aria-labelledby={`${id}-prices`}>
          <h3 id={`${id}-prices`}>Price per ticket</h3>
          <p className="event-ticket-help">Enter prices in euros. You can add promotions in the next step.</p>
          <div className="event-ticket-price-row">
            <div><h4>Guests</h4><p>Standard admission</p></div>
            <PriceField name="guestPrice" label="Guest price (€)" required placeholder="15.00" />
            <IncludedField name="entryIncluding" label="Guest extras (optional)" />
          </div>
          <div className="event-ticket-price-row">
            <div><h4>Members</h4><p>Member admission</p></div>
            {values.isMemberFree ? <p className="event-ticket-free-price">Free <span>€0.00 per ticket</span></p> : <PriceField name="memberPrice" label="Member price (€)" required placeholder="10.00" />}
            <IncludedField name="memberIncluding" label="Member extras (optional)" />
          </div>
          {!values.isMemberFree && (
            <div className="event-ticket-price-row">
              <div><h4>Active members</h4><p>Optional special rate</p></div>
              <PriceField name="activeMemberPrice" label="Active member price (€)" placeholder="8.00" />
              <p className="event-ticket-help">*Leave empty to use the member price.</p>
            </div>
          )}
        </section>
      )}
      {ticketType === "free" && <p className="event-ticket-notice">Everyone enters for free. Continue below to add your poster and ticket details.</p>}
      {ticketType === "external" && (
        <div className="event-ticket-external">
          <div className="rn-form-group">
            <label htmlFor={`${id}-link`}>Ticket website <span className="event-ticket-required">*</span></label>
            <Field id={`${id}-link`} type="url" name="ticketLink" placeholder="https://tickets.example.com/your-event" aria-describedby={`${id}-link-help`} />
            <ErrorMessage className="error" name="ticketLink" component="div" />
          </div>
          <p id={`${id}-link-help`} className="event-ticket-help">The event’s ticket button will open this link.</p>
        </div>
      )}

        </StepContentTransition>
      </div>

      <section aria-labelledby={`${id}-media`}>
        <h3 id={`${id}-media`}>Event images</h3>
        <div className="event-ticket-media-grid">
          <div className="event-ticket-media-panel event-ticket-media-panel--poster" data-custom-validation-field data-field-name="poster">
            <div className="event-ticket-media-heading">
              <h4 className="event-ticket-media-title">Event poster <span className="event-ticket-required">*</span></h4>
              <InfoHint label="About the event poster" text="The main promotional image shown on your event page and in event listings. Upload a JPG or PNG." />
            </div>
            <p className="event-ticket-help">The main image guests see for your event.</p>
            <ImageInput name="poster" initialImage={values.poster} onChange={(event) => setFieldValue("poster", event.target.files[0])} />
            <ErrorMessage className="error" name="poster" component="div" />
          </div>
          <div className="event-ticket-media-panel event-ticket-media-panel--ticket">
            <div data-custom-validation-field data-field-name="ticketImg">
              <div className="event-ticket-media-heading">
                <h4 className="event-ticket-media-title">Ticket image <span className="event-ticket-required">*</span></h4>
                <InfoHint label="About the ticket image" text="The artwork used on digital tickets. Upload a JPG or PNG with a 300:97 aspect ratio, for example 1500 × 485 pixels." />
              </div>
              <p className="event-ticket-help">JPG or PNG · 300:97 ratio (e.g., 1500 × 485 px).</p>
              <ImageInput name="ticketImg" initialImage={values.ticketImg} onChange={(event) => setFieldValue("ticketImg", event.target.files[0])} />
              <ErrorMessage className="error" name="ticketImg" component="div" />
            </div>
            <div className="event-ticket-appearance">
              <TicketSwitch name="ticketColor" label="Name text" onValue="#faf9f6" offValue="#272528" onLabel="Light" offLabel="Dark" />
              <TicketSwitch name="ticketName" label="Guest name" onValue="true" offValue="false" onLabel="Shown" offLabel="Hidden" />
              <TicketSwitch name="ticketQR" label="QR code" onValue="true" offValue="false" onLabel="Shown" offLabel="Hidden" />
            </div>
          </div>
        </div>
        {children}
      </section>

      <section aria-labelledby={`${id}-settings`}>
        <h3 id={`${id}-settings`}>Ticket settings</h3>
        <div className="event-ticket-settings">
          <div className="rn-form-group">
            <label htmlFor={`${id}-limit`}>Ticket limit <span className="event-ticket-required">*</span></label>
            <span className="event-ticket-field-hint"><InfoHint label="About the ticket limit" text="The maximum number of tickets available for this event." /></span>
            <Field id={`${id}-limit`} type="number" placeholder="e.g., 100" name="ticketLimit" min={1} step={1} />
            <ErrorMessage className="error" name="ticketLimit" component="div" />
          </div>
          <div className="rn-form-group">
            <label>Sales deadline <span className="event-ticket-required">*</span></label>
            <span className="event-ticket-field-hint"><InfoHint label="About the sales deadline" text="Ticket sales close automatically at this date and time." /></span>
            <div data-field-name="ticketTimer">
              <CalendarWithClock name="ticketTimer" mode="single" locale="en-nl" placeholder="Select ticket sales deadline" captionLayout="dropdown" min={values.date ? new Date(values.date) : new Date()} initialValue={values.ticketTimer} onSelect={(value) => setFieldValue("ticketTimer", value)} />
            </div>
            <ErrorMessage className="error" name="ticketTimer" component="div" />
          </div>
        </div>
      </section>
    </div>
  );
}

EventTicketsMedia.propTypes = { children: PropTypes.node };
