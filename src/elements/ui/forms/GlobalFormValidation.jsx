"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";
import { INCORRECT_MISSING_DATA } from "../../../util/defines/common";

const generatedMessageClass = "form-validation-generated-error";
let generatedMessageIndex = 0;
const focusableControlSelector = [
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const isElementVisible = (element) => {
  if (
    !element ||
    element.hidden ||
    element.closest("[hidden], [aria-hidden='true']")
  ) {
    return false;
  }

  let current = element;
  while (current && current.nodeType === 1) {
    const style = globalThis.getComputedStyle?.(current);
    if (
      style?.display === "none" ||
      style?.visibility === "hidden" ||
      style?.visibility === "collapse"
    ) {
      return false;
    }
    current = current.parentElement;
  }

  return true;
};

const fieldContainer = (field) =>
  field.closest(
    "[data-custom-validation-field], [data-field-path], [data-field-name], .rn-form-group, .form-group, .field, .purchase-consent-field"
  ) || field;

const messageHostFor = (field, container) =>
  container === field ? field.parentElement : container;

const generatedMessageKey = (field) =>
  field.dataset.fieldPath ||
  field.dataset.fieldName ||
  field.getAttribute("name") ||
  field.id ||
  "field";

const generatedMessagesFor = (container, field) => {
  const key = generatedMessageKey(field);
  return Array.from(
    container?.querySelectorAll(`.${generatedMessageClass}`) || []
  ).filter((message) => message.dataset.validationMessageFor === key);
};

const validationMessageFor = (field) => {
  const { validity } = field;

  if (validity.customError) return field.validationMessage;
  if (validity.valueMissing) {
    return field.closest("[data-custom-validation-field]")
      ? field.dataset.validationMessage || field.validationMessage
      : "";
  }
  if (validity.typeMismatch && field.type === "email") {
    return "Please enter a valid email address.";
  }
  if (validity.tooShort) {
    return `Please enter at least ${field.minLength} characters.`;
  }
  if (validity.tooLong) {
    return `Please use no more than ${field.maxLength} characters.`;
  }
  if (validity.rangeUnderflow) {
    return `Please enter a value of at least ${field.min}.`;
  }
  if (validity.rangeOverflow) {
    return `Please enter a value no greater than ${field.max}.`;
  }
  if (validity.patternMismatch) {
    return field.dataset.validationMessage || "Please use the requested format.";
  }
  if (validity.badInput) {
    return field.validationMessage;
  }

  return "Please enter a valid value.";
};

const clearFormValidation = (form) => {
  form
    .querySelectorAll('[data-form-validation-invalid="true"]')
    .forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("data-form-validation-invalid");
    });
  form.querySelectorAll(".has-validation-error").forEach((container) => {
    container.classList.remove("has-validation-error");
  });
  form
    .querySelectorAll(`.${generatedMessageClass}`)
    .forEach((message) => message.remove());
  form
    .querySelectorAll('[data-form-validation-error-message="true"]')
    .forEach((field) => {
      field.removeAttribute("data-form-validation-error-message");
      field.removeAttribute("aria-errormessage");
    });
  form
    .querySelectorAll('[data-form-validation-focus-target="true"]')
    .forEach((target) => {
      target.removeAttribute("data-form-validation-focus-target");
      target.removeAttribute("tabindex");
    });
};

const renderFieldValidation = (field) => {
  field.setAttribute("aria-invalid", "true");
  field.dataset.formValidationInvalid = "true";
  const container = fieldContainer(field);
  container?.classList.add("has-validation-error");
  const messageHost = messageHostFor(field, container);

  const message = validationMessageFor(field);
  const existingMessages = generatedMessagesFor(messageHost, field);

  if (!message || !messageHost) {
    existingMessages.forEach((element) => element.remove());
    return;
  }

  const messageElement = existingMessages[0] ||
    field.ownerDocument.createElement("div");
  existingMessages.slice(1).forEach((element) => element.remove());

  if (!messageElement.id) {
    generatedMessageIndex += 1;
    messageElement.id = `form-validation-error-${generatedMessageIndex}`;
    messageElement.className = `error ${generatedMessageClass}`;
    messageElement.setAttribute("role", "alert");
    messageElement.dataset.validationMessageFor = generatedMessageKey(field);
    if (container === field) {
      field.insertAdjacentElement("afterend", messageElement);
    } else {
      messageHost.append(messageElement);
    }
  }
  messageElement.textContent = message;
  if (!field.hasAttribute("aria-errormessage")) {
    field.setAttribute("aria-errormessage", messageElement.id);
    field.dataset.formValidationErrorMessage = "true";
  }
};

const firstFocusableWithin = (target) => {
  if (!target) return null;
  if (
    target.matches?.(focusableControlSelector) &&
    isElementVisible(target)
  ) {
    return target;
  }

  return Array.from(
    target.querySelectorAll?.(focusableControlSelector) || []
  ).find(isElementVisible);
};

const focusValidationTarget = (target) => {
  const focusTarget = firstFocusableWithin(target) || target;
  if (!focusTarget?.focus || !isElementVisible(focusTarget)) return;

  if (
    focusTarget === target &&
    !focusTarget.matches?.(focusableControlSelector) &&
    !focusTarget.hasAttribute("tabindex")
  ) {
    focusTarget.tabIndex = -1;
    focusTarget.dataset.formValidationFocusTarget = "true";
  }

  focusTarget.focus({ preventScroll: true });
};

const GlobalFormValidation = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const pendingForms = new WeakSet();
    const scheduledFrames = new Set();
    const scheduleFrame =
      globalThis.requestAnimationFrame?.bind(globalThis) ||
      ((callback) => globalThis.setTimeout(callback, 0));
    const cancelFrame =
      globalThis.cancelAnimationFrame?.bind(globalThis) ||
      globalThis.clearTimeout.bind(globalThis);

    const handleInvalid = (event) => {
      const field = event.target;
      const form = field?.form;

      if (!form) return;

      event.preventDefault();
      form.dataset.validationSubmitted = "true";

      if (pendingForms.has(form)) return;
      pendingForms.add(form);

      let frame;
      frame = scheduleFrame(() => {
        scheduledFrames.delete(frame);
        pendingForms.delete(form);
        if (!form.isConnected) return;

        clearFormValidation(form);
        const invalidFields = Array.from(form.elements).filter(
          (element) =>
            element.willValidate &&
            element.validity &&
            !element.validity.valid
        );

        invalidFields.forEach(renderFieldValidation);

        if (invalidFields.length === 0) return;

        dispatch(showNotification(INCORRECT_MISSING_DATA));

        const firstInvalid = invalidFields.find((invalidField) =>
          isElementVisible(fieldContainer(invalidField))
        );
        const scrollTarget = firstInvalid
          ? fieldContainer(firstInvalid)
          : null;
        if (!scrollTarget) return;

        const reduceMotion = globalThis.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        scrollTarget.scrollIntoView?.({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
        focusValidationTarget(scrollTarget);
      });
      scheduledFrames.add(frame);
    };

    const handleSubmit = (event) => {
      const form = event.target;
      if (!form?.matches?.("form")) return;

      form.dataset.validationSubmitted = "true";
      clearFormValidation(form);
    };

    document.addEventListener("invalid", handleInvalid, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      scheduledFrames.forEach((frame) => cancelFrame(frame));
      document.removeEventListener("invalid", handleInvalid, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [dispatch]);

  return null;
};

export default GlobalFormValidation;
