import test from "node:test";
import assert from "node:assert/strict";
import { eventEditSection, focusEventEditSection } from "../src/util/functions/event-edit-sections.mjs";

test("modal panels open their matching form step", () => {
  const expected = { details: 0, description: 0, media: 1, tickets: 1, pricing: 1, questions: 1, upsell: 2, addons: 2, advertised: 2 };
  for (const [name, step] of Object.entries(expected)) assert.equal(eventEditSection(name).step, step);
  for (const invalid of [undefined, null, "", "toString", "__proto__", "[name=title]"]) assert.equal(eventEditSection(invalid), null);
});

function control({ disabled = false, hidden = false, visible = true } = {}) {
  return {
    matches: () => disabled,
    closest: () => hidden,
    getClientRects: () => visible ? [{}] : [],
    focus(options) { this.focusOptions = options; },
  };
}

function formFor(section, controls) {
  const container = {
    querySelectorAll: selector => controls[selector] ?? [],
    scrollIntoView(options) { this.scrollOptions = options; },
  };
  return { container, form: { querySelector: selector => selector === section.selector ? container : null } };
}

test("skips a locked region and focuses location while scrolling to the section start", () => {
  const section = eventEditSection("details");
  const region = control({ disabled: true });
  const location = control();
  const { form, container } = formFor(section, { '[name="region"]': [region], '[name="location"]': [location] });
  assert.equal(focusEventEditSection(form, section), true);
  assert.equal(region.focusOptions, undefined);
  assert.deepEqual(location.focusOptions, { preventScroll: true });
  assert.deepEqual(container.scrollOptions, { block: "start", behavior: "instant" });
});

test("prefers the add-on heading input over its toggle, falling back when collapsed", () => {
  const section = eventEditSection("addons");
  const title = control();
  const toggle = control();
  const { form } = formFor(section, { '[name="addOns.title"]': [title], '[role="switch"]': [toggle] });
  assert.equal(focusEventEditSection(form, section), true);
  assert.ok(title.focusOptions);
  assert.equal(toggle.focusOptions, undefined);
  title.getClientRects = () => [];
  assert.equal(focusEventEditSection(form, section), true);
  assert.ok(toggle.focusOptions);
});

test("does not focus hidden steps, inert transition copies, or missing controls", () => {
  const section = eventEditSection("upsell");
  const hidden = control({ hidden: true });
  const { form } = formFor(section, { '[role="switch"]': [hidden] });
  assert.equal(focusEventEditSection(form, section), false);
  assert.equal(hidden.focusOptions, undefined);
  assert.equal(focusEventEditSection(null, section), false);
});
