// Only these named destinations can be opened from the event details modal.
const sections = {
  details: { step: 0, selector: '[aria-labelledby="event-step-details"]', controls: '[name="region"], [name="location"]' },
  description: { step: 0, selector: '[name="text"]' },
  media: { step: 1, selector: '[data-field-name="poster"]', controls: '.image_input_window' },
  tickets: { step: 1, selector: '.event-ticket-settings', controls: '[name="ticketLimit"]' },
  pricing: { step: 1, selector: '.event-ticket-types', controls: 'input:checked' },
  questions: { step: 1, selector: '.event-collect-data', controls: 'input, textarea, .event-collect-data__add-question' },
  upsell: { step: 2, selector: '.event-upsell', controls: '[role="switch"]' },
  addons: { step: 2, selector: '[data-event-option="addOns"]', controls: '[name="addOns.title"], [role="switch"]' },
  advertised: { step: 2, selector: '.event-related-picker', controls: 'input[type="search"]' },
};

export function eventEditSection(name) {
  return Object.hasOwn(sections, name) ? sections[name] : null;
}

export function focusEventEditSection(form, section) {
  const container = form?.querySelector(section.selector);
  if (!container) return false;
  const candidates = section.controls ? section.controls.split(',').flatMap(selector => [...container.querySelectorAll(selector.trim())]) : [container];
  const control = candidates.find(node => !node.matches(':disabled') && !node.closest('[hidden], [inert]') && node.getClientRects().length);
  if (!control) return false;
  control.focus({ preventScroll: true });
  container.scrollIntoView({ block: 'start', behavior: 'instant' });
  return true;
}
