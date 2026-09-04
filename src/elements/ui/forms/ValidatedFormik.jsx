"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  Form as FormikForm,
  Formik,
  getIn,
  prepareDataForValidation,
  useFormikContext,
} from "formik";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";
import { INCORRECT_MISSING_DATA } from "../../../util/defines/common";

const REQUIRED_ERROR_TYPES = new Set([
  "defined",
  "nonNullable",
  "optionality",
  "required",
]);

// Deliberately narrow fallbacks for custom validators and schemas whose
// errors do not expose a Yup `type`. Format errors must remain visible.
const REQUIRED_ERROR_PATTERNS = [
  /^required[.!]?$/i,
  /\bis (?:a )?required field[.!]?$/i,
  /\bis required[.!]?$/i,
  /\bare required[.!]?$/i,
  /^terms must be accepted[.!]?$/i,
  /^please (?:accept|agree to) .+[.!]?$/i,
  /^please (?:choose|select) an option[.!]?$/i,
  /задължителн(?:о|а|и)?[.!]?$/i,
  /^моля (?:изберете|отговорете|попълнете)(?: на въпроса)?[.!]?$/i,
  /^трябва да (?:приемеш|дадеш съгласие).+[.!]?$/i,
];

const FORM_CONTROL_SELECTOR = [
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");
const ERROR_MESSAGE_SELECTOR = [
  ".error",
  ".error-message",
  "[data-validation-message-for]",
  "[data-error-for]",
].join(", ");

const normalizePath = (path) =>
  String(path || "")
    .replace(/\[([^\]]+)\]/g, (_match, key) => {
      const unquotedKey = key.replace(/^(["'])(.*)\1$/, "$2");
      return unquotedKey ? `.${unquotedKey}` : "";
    })
    .replace(/^\./, "");

const flattenErrorEntries = (errors, prefix = "") => {
  if (!errors || typeof errors !== "object") {
    return prefix && errors != null ? [{ path: prefix, message: errors }] : [];
  }

  return Object.entries(errors).flatMap(([key, value]) => {
    const path = prefix
      ? Array.isArray(errors)
        ? `${prefix}[${key}]`
        : `${prefix}.${key}`
      : key;

    if (value && typeof value === "object") {
      return flattenErrorEntries(value, path);
    }

    return value == null ? [] : [{ path, message: value }];
  });
};

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

const fieldPathFor = (element) =>
  element?.dataset?.fieldPath ||
  element?.dataset?.fieldName ||
  element?.getAttribute?.("name") ||
  "";

const findFieldContainer = (field) =>
  field?.closest("[data-custom-validation-field]") ||
  field?.closest(
    "[data-field-path], [data-field-name], .rn-form-group, .form-group, .field, .purchase-consent-field"
  ) || field;

const directErrorChild = (element) =>
  Array.from(element?.children || []).find((child) =>
    child.matches?.(ERROR_MESSAGE_SELECTOR)
  );

const findInlineMessage = (form, path, fields, container) => {
  const normalizedPath = normalizePath(path);
  const explicitlyLinkedMessage = Array.from(
    form.querySelectorAll("[data-validation-message-for], [data-error-for]")
  ).find((message) => {
    const linkedPath =
      message.dataset.validationMessageFor || message.dataset.errorFor;
    return linkedPath === path || normalizePath(linkedPath) === normalizedPath;
  });

  if (explicitlyLinkedMessage) return explicitlyLinkedMessage;

  const containerMessage = directErrorChild(container);
  if (containerMessage) return containerMessage;

  for (const field of fields) {
    let ancestor = field.parentElement;
    while (ancestor && ancestor !== form) {
      const message = directErrorChild(ancestor);
      if (message) return message;
      ancestor = ancestor.parentElement;
    }
  }

  return null;
};

const clearValidationState = (form) => {
  form
    ?.querySelectorAll('[data-form-validation-invalid="true"]')
    .forEach((field) => {
      field.removeAttribute("data-form-validation-invalid");
      field.removeAttribute("aria-invalid");
    });

  form?.querySelectorAll(".has-validation-error").forEach((container) => {
    container.classList.remove("has-validation-error");
  });

  form
    ?.querySelectorAll('[data-form-validation-message-hidden="true"]')
    .forEach((message) => {
      message.hidden = false;
      message.removeAttribute("data-form-validation-message-hidden");
    });

  form
    ?.querySelectorAll('[data-form-validation-error-message="true"]')
    .forEach((field) => {
      field.removeAttribute("data-form-validation-error-message");
      field.removeAttribute("aria-errormessage");
    });

  form
    ?.querySelectorAll('[data-form-validation-focus-target="true"]')
    .forEach((target) => {
      target.removeAttribute("data-form-validation-focus-target");
      target.removeAttribute("tabindex");
    });
};

const resolveValidationErrorTypes = async (validationSchema, values, path) => {
  let schema;

  try {
    schema =
      typeof validationSchema === "function"
        ? validationSchema()
        : validationSchema;
  } catch {
    return [];
  }

  if (!schema?.validateAt) return [];

  try {
    await schema.validateAt(path, values, { abortEarly: false });
  } catch (error) {
    return Array.from(
      new Set(
        [error?.type, ...(error?.inner || []).map((entry) => entry?.type)].filter(
          Boolean
        )
      )
    );
  }

  return [];
};

const isEmptyValue = (value) =>
  value == null ||
  value === false ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const valueAtPath = (values, path) =>
  values && Object.prototype.hasOwnProperty.call(values, path)
    ? values[path]
    : getIn(values, path);

const isRequiredOnlyError = ({
  fields,
  message,
  path,
  validationTypes,
  values,
}) => {
  const value = valueAtPath(values, path);
  if (!isEmptyValue(value)) return false;
  if (validationTypes.some((type) => REQUIRED_ERROR_TYPES.has(type))) {
    return true;
  }

  // An unchecked consent control is missing input, while a text field failing
  // `oneOf` (for example, password confirmation) is invalid and must explain
  // why. Control context keeps those two cases distinct.
  if (
    validationTypes.includes("oneOf") &&
    fields.some((field) => field.matches?.("input[type='checkbox'], input[type='radio']"))
  ) {
    return true;
  }

  // An empty array failing `min` means no option was selected. String `min`
  // errors remain visible so optional-but-invalid fields are not concealed.
  if (validationTypes.includes("min") && Array.isArray(value)) return true;

  return REQUIRED_ERROR_PATTERNS.some((pattern) =>
    pattern.test(String(message || "").trim())
  );
};

const addOwnerToFirstForm = (node, ownerId, state = { found: false }) =>
  Children.map(node, (child) => {
    if (!isValidElement(child) || state.found) return child;

    if (child.type === FormikForm || child.type === "form") {
      state.found = true;
      return cloneElement(child, {
        "data-form-validation-owner": ownerId,
        noValidate: true,
      });
    }

    if (!child.props?.children) return child;

    const nextChildren = addOwnerToFirstForm(
      child.props.children,
      ownerId,
      state
    );
    return cloneElement(child, undefined, nextChildren);
  });

const findOwnedForm = (marker, ownerId) => {
  const ownedForm = Array.from(
    globalThis.document?.querySelectorAll(
      "form[data-form-validation-owner]"
    ) || []
  ).find((form) => form.dataset.formValidationOwner === ownerId);

  if (ownedForm) return ownedForm;

  let sibling = marker?.nextElementSibling;
  while (sibling) {
    if (sibling.matches?.("form")) return sibling;
    const nestedForm = sibling.querySelector?.("form");
    if (nestedForm) return nestedForm;
    sibling = sibling.nextElementSibling;
  }

  return null;
};

const collectFieldsByError = (form, errorEntries) => {
  const exactPaths = new Map(
    errorEntries.map((entry) => [entry.path, entry.path])
  );
  const normalizedPaths = new Map(
    errorEntries.map((entry) => [normalizePath(entry.path), entry.path])
  );
  const fieldsByPath = new Map(errorEntries.map(({ path }) => [path, []]));

  form
    .querySelectorAll("[name], [data-field-name], [data-field-path]")
    .forEach((field) => {
      if (!isElementVisible(field)) return;

      const candidatePath = fieldPathFor(field);
      const errorPath =
        exactPaths.get(candidatePath) ||
        normalizedPaths.get(normalizePath(candidatePath));

      if (errorPath) fieldsByPath.get(errorPath)?.push(field);
    });

  return fieldsByPath;
};

const firstFocusableWithin = (target) => {
  if (!target) return null;
  if (target.matches?.(FORM_CONTROL_SELECTOR) && isElementVisible(target)) {
    return target;
  }

  return Array.from(target.querySelectorAll?.(FORM_CONTROL_SELECTOR) || []).find(
    isElementVisible
  );
};

const focusValidationTarget = (target) => {
  const focusTarget = firstFocusableWithin(target) || target;
  if (!focusTarget?.focus || !isElementVisible(focusTarget)) return;

  if (
    focusTarget === target &&
    !focusTarget.matches?.(FORM_CONTROL_SELECTOR) &&
    !focusTarget.hasAttribute("tabindex")
  ) {
    focusTarget.tabIndex = -1;
    focusTarget.dataset.formValidationFocusTarget = "true";
  }

  focusTarget.focus({ preventScroll: true });
};

const FormikValidationEffects = ({ ownerId, validationSchema }) => {
  const { errors, isValidating, submitCount, values } = useFormikContext();
  const dispatch = useDispatch();
  const markerRef = useRef(null);
  const handledSubmitRef = useRef(0);
  const scrollFrameRef = useRef(null);

  useEffect(() => {
    const form = findOwnedForm(markerRef.current, ownerId);
    if (form) form.noValidate = true;
  }, [ownerId]);

  useEffect(() => {
    if (submitCount === 0) {
      if (handledSubmitRef.current > 0) {
        clearValidationState(findOwnedForm(markerRef.current, ownerId));
        handledSubmitRef.current = 0;
      }
      return undefined;
    }

    if (
      isValidating ||
      handledSubmitRef.current === submitCount
    ) {
      return undefined;
    }

    const form = findOwnedForm(markerRef.current, ownerId);
    if (!form) return undefined;

    handledSubmitRef.current = submitCount;
    form.noValidate = true;
    form.dataset.validationSubmitted = "true";
    clearValidationState(form);

    const errorEntries = flattenErrorEntries(errors);
    if (errorEntries.length === 0) return undefined;

    let cancelled = false;

    const presentErrors = async () => {
      const fieldsByPath = collectFieldsByError(form, errorEntries);
      const validationValues = prepareDataForValidation(values);
      const validationTypesByPath = await Promise.all(
        errorEntries.map(({ path }) =>
          resolveValidationErrorTypes(validationSchema, validationValues, path)
        )
      );

      if (cancelled || !form.isConnected) return;

      const scrollTargets = [];

      errorEntries.forEach(({ message, path }, index) => {
        const fields = fieldsByPath.get(path) || [];
        if (fields.length === 0) return;

        fields.forEach((field) => {
          field.setAttribute("aria-invalid", "true");
          field.dataset.formValidationInvalid = "true";
        });

        const container = findFieldContainer(fields[0]);
        container?.classList.add("has-validation-error");
        scrollTargets.push(container || fields[0]);

        const inlineMessage = findInlineMessage(
          form,
          path,
          fields,
          container
        );
        const isCustomField = fields.some((field) =>
          field.closest?.("[data-custom-validation-field]")
        );
        const shouldHideMessage =
          !isCustomField &&
          isRequiredOnlyError({
            fields,
            message,
            path,
            validationTypes: validationTypesByPath[index],
            values,
          });

        if (!inlineMessage) return;

        if (shouldHideMessage) {
          inlineMessage.hidden = true;
          inlineMessage.dataset.formValidationMessageHidden = "true";
          inlineMessage.removeAttribute("role");
        } else {
          inlineMessage.hidden = false;
          inlineMessage.removeAttribute("data-form-validation-message-hidden");
          inlineMessage.setAttribute("role", "alert");

          if (!inlineMessage.id) {
            inlineMessage.id = `form-validation-${ownerId.replace(
              /[^a-zA-Z0-9_-]/g,
              ""
            )}-${index}`;
          }
          fields.forEach((field) => {
            if (!field.hasAttribute("aria-errormessage")) {
              field.setAttribute("aria-errormessage", inlineMessage.id);
              field.dataset.formValidationErrorMessage = "true";
            }
          });
        }
      });

      dispatch(showNotification(INCORRECT_MISSING_DATA));

      const positionFollowing =
        globalThis.Node?.DOCUMENT_POSITION_FOLLOWING ?? 4;
      scrollTargets.sort((first, second) => {
        if (first === second) return 0;
        return first.compareDocumentPosition(second) & positionFollowing
          ? -1
          : 1;
      });

      const firstInvalidTarget = scrollTargets[0];
      if (!firstInvalidTarget) return;

      scrollFrameRef.current = globalThis.requestAnimationFrame?.(() => {
        if (cancelled || !firstInvalidTarget.isConnected) return;

        const reduceMotion = globalThis.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        firstInvalidTarget.scrollIntoView?.({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
        focusValidationTarget(firstInvalidTarget);
      });
    };

    presentErrors();

    return () => {
      cancelled = true;
      if (scrollFrameRef.current != null) {
        globalThis.cancelAnimationFrame?.(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
    // A submitted snapshot must finish presenting even if the user starts
    // typing immediately. The next submit/isValidating transition replaces it.
  }, [dispatch, isValidating, ownerId, submitCount]);

  return <span ref={markerRef} hidden aria-hidden="true" />;
};

FormikValidationEffects.propTypes = {
  ownerId: PropTypes.string.isRequired,
  validationSchema: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
};

const ValidatedFormik = ({ children, validationSchema, ...props }) => {
  const ownerId = useId();

  return (
    <Formik
      {...props}
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
    >
      {(formikProps) => {
        const renderedChildren =
          typeof children === "function" ? children(formikProps) : children;

        return (
          <>
            <FormikValidationEffects
              ownerId={ownerId}
              validationSchema={validationSchema}
            />
            {addOwnerToFirstForm(renderedChildren, ownerId)}
          </>
        );
      }}
    </Formik>
  );
};

ValidatedFormik.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  validationSchema: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default ValidatedFormik;
