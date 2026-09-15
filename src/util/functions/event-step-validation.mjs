export const eventStepFields = [
  ["region", "location", "title", "date", "text"],
  ["isFree", "isMemberFree", "isTicketLink", "ticketLink", "guestPrice", "memberPrice", "activeMemberPrice", "entryIncluding", "memberIncluding", "poster", "ticketImg", "ticketColor", "ticketName", "ticketQR", "ticketLimit", "ticketTimer", "extraImagesValidation", "extraInputsForm"],
];

function errorPaths(value, prefix) {
  if (typeof value === "string") return [prefix];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => errorPaths(child, `${prefix}.${key}`));
}

// Validate every completed step before a forward jump, so returning to an
// earlier step cannot bypass fields invalidated in an already visited step.
export function blockingEventStep(errors, targetStep) {
  for (let step = 0; step < Math.min(targetStep, eventStepFields.length); step++) {
    const paths = eventStepFields[step].flatMap((field) => errorPaths(errors[field], field));
    if (paths.length) return { step, paths };
  }
  return null;
}

// Ignore malformed or obsolete step indexes in saved drafts.
export function eventDraftProgress(progress, stepCount) {
  const validStep = value => Number.isInteger(value) && value >= 0 && value < stepCount;
  const currentStep = validStep(progress?.currentStep) ? progress.currentStep : 0;
  const furthestStep = validStep(progress?.furthestStep)
    ? Math.max(currentStep, progress.furthestStep)
    : currentStep;
  return { currentStep, furthestStep };
}
