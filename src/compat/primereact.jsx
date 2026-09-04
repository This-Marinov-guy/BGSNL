"use client";

/* eslint-disable react/prop-types -- This migration boundary intentionally accepts the v10 component prop surface. */

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Badge as PrimeBadge } from "@primereact/ui/badge";
import { Button as PrimeButton } from "@primereact/ui/button";
import { Card as PrimeCard } from "@primereact/ui/card";
import { DatePicker as PrimeDatePicker } from "@primereact/ui/datepicker";
import { FloatLabel as PrimeFloatLabel } from "@primereact/ui/floatlabel";
import { IconField as PrimeIconField } from "@primereact/ui/iconfield";
import { InputNumber as PrimeInputNumber } from "@primereact/ui/inputnumber";
import { InputOtp as PrimeInputOtp } from "@primereact/ui/inputotp";
import { InputPassword as PrimeInputPassword } from "@primereact/ui/inputpassword";
import { InputText as PrimeInputText } from "@primereact/ui/inputtext";
import { Message as PrimeMessage } from "@primereact/ui/message";
import { Paginator as PrimePaginator } from "@primereact/ui/paginator";
import { ProgressSpinner as PrimeProgressSpinner } from "@primereact/ui/progressspinner";
import { Select as PrimeSelect } from "@primereact/ui/select";
import { Skeleton as PrimeSkeleton } from "@primereact/ui/skeleton";
import { Stepper as PrimeStepper } from "@primereact/ui/stepper";
import { Tabs as PrimeTabs } from "@primereact/ui/tabs";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiInfo,
  FiXCircle,
  IconlyHide,
  IconlyShow,
} from "@/elements/ui/icons/IconlyIcons";
import AppModal from "@/elements/ui/modals/AppModal";

const joinClasses = (...names) => names.filter(Boolean).join(" ");

export const Badge = forwardRef(function Badge(
  { value, children, size, ...props },
  ref
) {
  return (
    <PrimeBadge ref={ref} size={size === "medium" ? undefined : size} {...props}>
      {children ?? value}
    </PrimeBadge>
  );
});

export const Button = forwardRef(function Button(
  {
    label,
    icon,
    iconPos = "left",
    outlined,
    text,
    link,
    children,
    ...props
  },
  ref
) {
  const variant = link ? "link" : text ? "text" : outlined ? "outlined" : props.variant;
  const iconNode = typeof icon === "string" ? <i className={icon} aria-hidden /> : icon;

  return (
    <PrimeButton ref={ref} {...props} variant={variant}>
      {iconPos === "left" && iconNode}
      {children ?? label}
      {iconPos === "right" && iconNode}
    </PrimeButton>
  );
});

export const Skeleton = PrimeSkeleton;
export const FloatLabel = PrimeFloatLabel;
export const InputText = PrimeInputText;

export const Password = forwardRef(function Password(
  {
    toggleMask,
    feedback: _feedback,
    onChange,
    onValueChange,
    className,
    inputClassName,
    ...props
  },
  ref
) {
  void _feedback;
  const [masked, setMasked] = useState(true);
  const input = (
    <PrimeInputPassword
      ref={ref}
      {...props}
      className={joinClasses(className, inputClassName)}
      mask={masked}
      onValueChange={(event) => {
        onValueChange?.(event);
        if (onChange) {
          onChange(
            event.originalEvent ?? {
              target: { name: props.name, value: event.value },
              currentTarget: { name: props.name, value: event.value },
            }
          );
        }
      }}
    />
  );

  if (!toggleMask) return input;

  return (
    <span className="p-password-legacy-wrapper">
      {input}
      <button
        type="button"
        className="p-password-toggle"
        aria-label={masked ? "Show password" : "Hide password"}
        onClick={() => setMasked((current) => !current)}
      >
        {masked ? <IconlyShow size={22} /> : <IconlyHide size={22} />}
      </button>
    </span>
  );
});

export function IconField({ iconPosition = "left", className, ...props }) {
  return (
    <PrimeIconField.Root
      {...props}
      className={joinClasses(className, `p-icon-field-${iconPosition}`)}
    />
  );
}

export function InputIcon({ className, children, ...props }) {
  return (
    <PrimeIconField.Inset className={className} {...props}>
      {children}
    </PrimeIconField.Inset>
  );
}

export function InputNumber({
  className,
  inputClassName,
  style,
  inputStyle,
  placeholder,
  showButtons,
  buttonLayout,
  decrementButtonClassName,
  incrementButtonClassName,
  decrementButtonIcon,
  incrementButtonIcon,
  onValueChange,
  onChange,
  name,
  required,
  ...props
}) {
  const emit = (event) => {
    const legacyEvent = {
      ...event,
      target: { name, value: event.value },
      currentTarget: { name, value: event.value },
    };
    onValueChange?.(legacyEvent);
    onChange?.(legacyEvent);
  };

  return (
    <PrimeInputNumber.Root
      {...props}
      name={name}
      onValueChange={emit}
      className={joinClasses(
        className,
        showButtons && buttonLayout === "horizontal" && "p-inputnumber-buttons-horizontal"
      )}
      style={style}
    >
      {showButtons && (
        <PrimeInputNumber.Decrement
          type="button"
          className={decrementButtonClassName}
          aria-label="Decrease value"
        >
          {decrementButtonIcon || "−"}
        </PrimeInputNumber.Decrement>
      )}
      <PrimeInputNumber.Input
        name={name}
        required={required}
        aria-required={required || undefined}
        placeholder={placeholder}
        className={inputClassName}
        style={inputStyle}
      />
      {showButtons && (
        <PrimeInputNumber.Increment
          type="button"
          className={incrementButtonClassName}
          aria-label="Increase value"
        >
          {incrementButtonIcon || "+"}
        </PrimeInputNumber.Increment>
      )}
    </PrimeInputNumber.Root>
  );
}

export function InputOtp({ length = 4, onChange, onValueChange, ...props }) {
  return (
    <PrimeInputOtp.Root
      {...props}
      onValueChange={(event) => {
        onValueChange?.(event);
        onChange?.({
          ...event,
          target: { name: props.name, value: event.value },
          currentTarget: { name: props.name, value: event.value },
        });
      }}
    >
      {Array.from({ length }, (_, index) => (
        <PrimeInputOtp.Text key={index} index={index} />
      ))}
    </PrimeInputOtp.Root>
  );
}

const messageIcons = {
  success: FiCheckCircle,
  info: FiInfo,
  warn: FiAlertCircle,
  error: FiXCircle,
};

export function Message({ text, children, severity = "info", icon, ...props }) {
  const Icon = messageIcons[severity] ?? FiInfo;
  return (
    <PrimeMessage.Root severity={severity} {...props}>
      <PrimeMessage.Content>
        <PrimeMessage.Icon>{icon || <Icon aria-hidden />}</PrimeMessage.Icon>
        <PrimeMessage.Text>{children ?? text}</PrimeMessage.Text>
      </PrimeMessage.Content>
    </PrimeMessage.Root>
  );
}

export function Paginator({
  first = 0,
  rows = 10,
  totalRecords = 0,
  rowsPerPageOptions,
  onPageChange,
  ...props
}) {
  const page = Math.floor(first / rows) + 1;
  const emit = (nextPage, nextRows = rows, originalEvent = null) => {
    onPageChange?.({
      originalEvent,
      first: (nextPage - 1) * nextRows,
      rows: nextRows,
      page: nextPage - 1,
      pageCount: Math.ceil(totalRecords / nextRows),
    });
  };

  return (
    <div className="p-paginator-legacy-wrapper">
      <PrimePaginator.Root
        {...props}
        page={page}
        total={totalRecords}
        itemsPerPage={rows}
        onPageChange={(event) => emit(event.value, rows, event.originalEvent)}
      >
        <PrimePaginator.Content>
          <PrimePaginator.First />
          <PrimePaginator.Prev />
          <PrimePaginator.Pages>
            {(instance) =>
              instance.paginator?.pages.map((item, index) =>
                item.type === "page" ? (
                  <PrimePaginator.Page key={`page-${item.value}`} value={item.value} />
                ) : (
                  <PrimePaginator.Ellipsis key={`ellipsis-${index}`}>…</PrimePaginator.Ellipsis>
                )
              )
            }
          </PrimePaginator.Pages>
          <PrimePaginator.Next />
          <PrimePaginator.Last />
          {rowsPerPageOptions?.length > 0 && (
            <select
              aria-label="Items per page"
              className="p-paginator-rpp-options"
              value={rows}
              onChange={(event) => emit(1, Number(event.target.value), event)}
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </PrimePaginator.Content>
      </PrimePaginator.Root>
    </div>
  );
}

export function ProgressSpinner({
  animationDuration,
  className,
  style,
  strokeWidth,
  ...props
}) {
  return (
    <PrimeProgressSpinner.Root
      aria-label="Loading"
      className={className}
      style={{ ...style, animationDuration }}
      strokeWidth={strokeWidth ? Number(strokeWidth) : undefined}
      {...props}
    >
      <PrimeProgressSpinner.Track />
      <PrimeProgressSpinner.Range />
    </PrimeProgressSpinner.Root>
  );
}

export function Card({ header, title, subTitle, footer, children, ...props }) {
  return (
    <PrimeCard.Root {...props}>
      {header != null && <PrimeCard.Header>{header}</PrimeCard.Header>}
      <PrimeCard.Body>
        {(title != null || subTitle != null) && (
          <PrimeCard.Caption>
            {title != null && <PrimeCard.Title>{title}</PrimeCard.Title>}
            {subTitle != null && <PrimeCard.Subtitle>{subTitle}</PrimeCard.Subtitle>}
          </PrimeCard.Caption>
        )}
        {children != null && <PrimeCard.Content>{children}</PrimeCard.Content>}
        {footer != null && <PrimeCard.Footer>{footer}</PrimeCard.Footer>}
      </PrimeCard.Body>
    </PrimeCard.Root>
  );
}

export function Dialog({
  visible,
  onHide,
  header,
  footer,
  children,
  closable = true,
  dismissableMask = false,
  className,
  contentClassName,
  headerClassName,
  style,
  contentStyle,
  headerStyle,
  modal = true,
  maximizable,
  maximized,
  ...props
}) {
  void maximizable;
  void maximized;

  return (
    <AppModal
      open={Boolean(visible)}
      onClose={onHide}
      title={header}
      actions={footer}
      modal={modal}
      dismissableMask={dismissableMask}
      closable={closable}
      className={className}
      contentClassName={contentClassName}
      headerClassName={headerClassName}
      style={style}
      contentStyle={contentStyle}
      headerStyle={headerStyle}
      blockScroll={props.blockScroll}
      ariaLabel={props["aria-label"]}
      {...props}
    >
      {children}
    </AppModal>
  );
}

const normalizeSelectSearch = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, "");

export function Dropdown({
  value,
  onChange,
  options = [],
  optionKey,
  optionLabel,
  optionValue,
  optionGroupLabel,
  optionGroupChildren,
  placeholder,
  filter,
  filterBy,
  filterPlaceholder,
  className,
  style,
  name,
  ariaLabel,
  onOpenChange,
  appendTo,
  panelClassName,
  filterFallbackOption,
  filterFallbackGroupLabel = "No matches",
  optionGroupTemplate,
  optionTemplate,
  valueTemplate,
  ...props
}) {
  const [filterValue, setFilterValue] = useState("");
  const filteredOptions = useMemo(() => {
    const query = normalizeSelectSearch(filterValue);
    if (!filter || !query) return options;

    const fields = filterBy
      ? filterBy.split(",").map((field) => field.trim()).filter(Boolean)
      : optionLabel
        ? [optionLabel]
        : [];
    const matches = (option) => {
      if (option == null) return false;
      if (typeof option !== "object") {
        return normalizeSelectSearch(option).includes(query);
      }

      const values = fields.length > 0
        ? fields.map((field) => option[field])
        : Object.values(option);
      return values.some((fieldValue) =>
        normalizeSelectSearch(fieldValue).includes(query)
      );
    };

    if (!optionGroupChildren) {
      const matchesOnly = options.filter(matches);
      return matchesOnly.length === 0 && filterFallbackOption
        ? [filterFallbackOption]
        : matchesOnly;
    }

    const matchingGroups = options
      .map((group) => ({
        ...group,
        [optionGroupChildren]: (group[optionGroupChildren] ?? []).filter(matches),
      }))
      .filter((group) => group[optionGroupChildren].length > 0);

    if (matchingGroups.length > 0 || !filterFallbackOption) {
      return matchingGroups;
    }

    return [
      {
        [optionGroupLabel ?? "label"]: filterFallbackGroupLabel,
        [optionGroupChildren]: [filterFallbackOption],
      },
    ];
  }, [
    filter,
    filterBy,
    filterFallbackGroupLabel,
    filterFallbackOption,
    filterValue,
    optionGroupChildren,
    optionGroupLabel,
    optionLabel,
    options,
  ]);

  return (
    <PrimeSelect.Root
      {...props}
      value={value}
      options={filteredOptions}
      optionKey={optionKey}
      optionLabel={optionLabel}
      optionValue={optionValue}
      optionGroupLabel={optionGroupLabel}
      optionGroupChildren={optionGroupChildren}
      className={className}
      style={style}
      onOpenChange={(event) => {
        if (!event.value) setFilterValue("");
        onOpenChange?.(event);
      }}
      onValueChange={(event) =>
        onChange?.({
          ...event,
          target: { name, value: event.value },
          currentTarget: { name, value: event.value },
        })
      }
    >
      <PrimeSelect.Trigger type="button" aria-label={ariaLabel}>
        <PrimeSelect.Value placeholder={placeholder}>
          {valueTemplate ? () => valueTemplate(value) : undefined}
        </PrimeSelect.Value>
        <PrimeSelect.Indicator>
          <FiChevronDown aria-hidden />
        </PrimeSelect.Indicator>
      </PrimeSelect.Trigger>
      <PrimeSelect.Portal appendTo={appendTo}>
        <PrimeSelect.Positioner>
          <PrimeSelect.Popup className={panelClassName}>
            {filter && (
              <PrimeSelect.Header>
                <input
                  type="search"
                  className="p-select-filter"
                  aria-label="Filter options"
                  placeholder={filterPlaceholder ?? "Search"}
                  value={filterValue}
                  onInput={(event) => setFilterValue(event.currentTarget.value)}
                />
              </PrimeSelect.Header>
            )}
            <PrimeSelect.List key={filterValue || "all-options"}>
              {(instance) =>
                instance.options?.map((option, index) => {
                  const grouped = instance.listbox?.isOptionGroup(option);
                  const source = grouped ? option.optionGroup : option;
                  const label = grouped
                    ? instance.listbox?.getOptionGroupLabel(source)
                    : instance.listbox?.getOptionLabel(option);

                  return (
                    <PrimeSelect.Option
                      key={`${grouped ? "group" : "option"}-${index}`}
                      index={index}
                      uKey={optionKey && source && typeof source === "object"
                        ? source[optionKey]
                        : undefined}
                      group={grouped}
                    >
                      {grouped
                        ? optionGroupTemplate?.(source) ?? label
                        : optionTemplate?.(option) ?? label}
                    </PrimeSelect.Option>
                  );
                })
              }
            </PrimeSelect.List>
            {filter && filterValue && filteredOptions.length === 0 ? (
              <span className="p-select-empty">No results found</span>
            ) : (
              <PrimeSelect.Empty>No results found</PrimeSelect.Empty>
            )}
          </PrimeSelect.Popup>
        </PrimeSelect.Positioner>
      </PrimeSelect.Portal>
    </PrimeSelect.Root>
  );
}

export const Calendar = forwardRef(function Calendar(
  {
    value,
    onChange,
    onSelect,
    className,
    inputClassName,
    inputId,
    id,
    placeholder,
    showIcon = true,
    showTime = false,
    showSeconds = false,
    showButtonBar = false,
    appendTo = "body",
    mode: legacyMode,
    locale: _locale,
    captionLayout: _captionLayout,
    touchUI: _touchUI,
    ...props
  },
  ref
) {
  void _locale;
  void _captionLayout;
  void _touchUI;

  const emitValue = (event) => {
    const legacyEvent = {
      ...event,
      target: { name: props.name, value: event.value },
      currentTarget: { name: props.name, value: event.value },
    };
    onChange?.(legacyEvent);
    onSelect?.(event.value);
  };

  return (
    <PrimeDatePicker.Root
      {...props}
      selectionMode={props.selectionMode ?? legacyMode}
      value={value || null}
      className={joinClasses("bgsnl-prime-calendar", className)}
      placeholder={placeholder}
      showTime={showTime}
      showSeconds={showSeconds}
      onValueChange={emitValue}
      fluid
    >
      <PrimeDatePicker.Input
        ref={ref}
        id={inputId ?? id}
        className={joinClasses("bgsnl-form-control", inputClassName)}
        placeholder={placeholder}
      />
      {showIcon ? (
        <PrimeDatePicker.Trigger type="button">
          {showTime ? <FiClock aria-hidden /> : <FiCalendar aria-hidden />}
        </PrimeDatePicker.Trigger>
      ) : null}
      <PrimeDatePicker.Portal appendTo={appendTo}>
        <PrimeDatePicker.Positioner>
          <PrimeDatePicker.Popup motionProps={{ name: "p-datepicker" }}>
            <PrimeDatePicker.Arrow />
            <PrimeDatePicker.Calendar>
              <PrimeDatePicker.Header>
                <PrimeDatePicker.Prev aria-label="Previous month">
                  <FiChevronLeft aria-hidden />
                </PrimeDatePicker.Prev>
                <PrimeDatePicker.Title>
                  <PrimeDatePicker.SelectMonth />
                  <PrimeDatePicker.SelectYear />
                  <PrimeDatePicker.Decade />
                </PrimeDatePicker.Title>
                <PrimeDatePicker.Next aria-label="Next month">
                  <FiChevronRight aria-hidden />
                </PrimeDatePicker.Next>
              </PrimeDatePicker.Header>
              <PrimeDatePicker.Table>
                <PrimeDatePicker.TableHead />
                <PrimeDatePicker.TableBody />
                <PrimeDatePicker.TableBody view="month" />
                <PrimeDatePicker.TableBody view="year" />
              </PrimeDatePicker.Table>
              {showButtonBar ? (
                <PrimeDatePicker.Buttonbar>
                  <PrimeDatePicker.Today>Today</PrimeDatePicker.Today>
                  <PrimeDatePicker.ClearTrigger>Clear</PrimeDatePicker.ClearTrigger>
                </PrimeDatePicker.Buttonbar>
              ) : null}
            </PrimeDatePicker.Calendar>
            {showTime ? (
              <PrimeDatePicker.Time>
                <PrimeDatePicker.Picker type="hour">
                  <PrimeDatePicker.Increment aria-label="Increase hour">
                    <FiChevronUp aria-hidden />
                  </PrimeDatePicker.Increment>
                  <PrimeDatePicker.Hour />
                  <PrimeDatePicker.Decrement aria-label="Decrease hour">
                    <FiChevronDown aria-hidden />
                  </PrimeDatePicker.Decrement>
                </PrimeDatePicker.Picker>
                <PrimeDatePicker.Separator />
                <PrimeDatePicker.Picker type="minute">
                  <PrimeDatePicker.Increment aria-label="Increase minute">
                    <FiChevronUp aria-hidden />
                  </PrimeDatePicker.Increment>
                  <PrimeDatePicker.Minute />
                  <PrimeDatePicker.Decrement aria-label="Decrease minute">
                    <FiChevronDown aria-hidden />
                  </PrimeDatePicker.Decrement>
                </PrimeDatePicker.Picker>
              </PrimeDatePicker.Time>
            ) : null}
          </PrimeDatePicker.Popup>
        </PrimeDatePicker.Positioner>
      </PrimeDatePicker.Portal>
    </PrimeDatePicker.Root>
  );
});

export function Steps({
  model = [],
  activeIndex = 0,
  onSelect,
  readOnly = true,
  ...props
}) {
  const activeValue = String(activeIndex + 1);
  return (
    <PrimeStepper.Root
      {...props}
      value={activeValue}
      onValueChange={(event) => {
        const index = Number(event.value) - 1;
        const item = model[index];
        onSelect?.({ index, item });
        item?.command?.({ index, item });
      }}
    >
      <PrimeStepper.List>
        {model.map((item, index) => (
          <PrimeStepper.Step key={item.label ?? index} value={String(index + 1)}>
            <PrimeStepper.Header disabled={readOnly || item.disabled}>
              <PrimeStepper.Number>{index + 1}</PrimeStepper.Number>
              <PrimeStepper.Title>
                {item.icon && <i className={item.icon} aria-hidden />} {item.label}
              </PrimeStepper.Title>
            </PrimeStepper.Header>
            {index < model.length - 1 && <PrimeStepper.Separator />}
          </PrimeStepper.Step>
        ))}
      </PrimeStepper.List>
    </PrimeStepper.Root>
  );
}

export function TabPanel() {
  return null;
}

TabPanel.displayName = "PrimeReactLegacyTabPanel";

export function TabView({ activeIndex = 0, onTabChange, children, ...props }) {
  const panels = Children.toArray(children).filter(isValidElement);
  const activeValue = String(activeIndex);

  return (
    <PrimeTabs.Root
      {...props}
      value={activeValue}
      onValueChange={(event) => onTabChange?.({ index: Number(event.value) })}
    >
      <PrimeTabs.List>
        <PrimeTabs.Content>
          {panels.map((panel, index) => (
            <PrimeTabs.Tab
              key={index}
              value={String(index)}
              disabled={panel.props.disabled}
            >
              {panel.props.leftIcon}
              {panel.props.header}
              {panel.props.rightIcon}
            </PrimeTabs.Tab>
          ))}
          <PrimeTabs.Indicator />
        </PrimeTabs.Content>
      </PrimeTabs.List>
      <PrimeTabs.Panels>
        {panels.map((panel, index) => (
          <PrimeTabs.Panel key={index} value={String(index)}>
            {panel.props.children}
          </PrimeTabs.Panel>
        ))}
      </PrimeTabs.Panels>
    </PrimeTabs.Root>
  );
}

export function Image({
  src,
  alt = "",
  preview,
  className,
  imageClassName,
  style,
  imageStyle,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const image = (
    <img
      src={src}
      alt={alt}
      className={imageClassName}
      style={imageStyle}
      {...props}
    />
  );

  return (
    <>
      <span className={className} style={style}>
        {preview ? (
          <button
            type="button"
            aria-label={`Preview ${alt || "image"}`}
            onClick={() => setOpen(true)}
            style={{ background: "transparent", border: 0, cursor: "zoom-in", padding: 0 }}
          >
            {image}
          </button>
        ) : (
          image
        )}
      </span>
      {preview && (
        <Dialog
          header="Image preview"
          visible={open}
          onHide={() => setOpen(false)}
          dismissableMask
          contentStyle={{ padding: 0 }}
          style={{ maxHeight: "95vh", maxWidth: "95vw" }}
        >
          <img
            src={src}
            alt={alt}
            style={{ display: "block", maxHeight: "85vh", maxWidth: "90vw" }}
          />
        </Dialog>
      )}
    </>
  );
}

export function Tooltip({ target, content }) {
  useEffect(() => {
    if (!target || typeof document === "undefined") return undefined;

    const applyTitles = () => {
      document.querySelectorAll(target).forEach((element) => {
        const text = content ?? element.getAttribute("data-pr-tooltip");
        if (text && !element.getAttribute("title")) {
          element.setAttribute("title", String(text));
          element.setAttribute("data-legacy-tooltip-title", "true");
        }
      });
    };

    applyTitles();
    const observer = new MutationObserver(applyTitles);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll(`${target}[data-legacy-tooltip-title]`).forEach((element) => {
        element.removeAttribute("title");
        element.removeAttribute("data-legacy-tooltip-title");
      });
    };
  }, [content, target]);

  return null;
}

const confirmListeners = new Set();

export function confirmPopup(options) {
  confirmListeners.forEach((listener) => listener(options));
}

export const confirmDialog = confirmPopup;

export function ConfirmPopup() {
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const listener = (options) => setConfirmation(options);
    confirmListeners.add(listener);
    return () => confirmListeners.delete(listener);
  }, []);

  const actions = useMemo(() => {
    if (!confirmation) return null;
    const close = (callback) => {
      setConfirmation(null);
      callback?.();
    };
    return (
      <>
        <Button severity="secondary" variant="outlined" onClick={() => close(confirmation.reject)}>
          {confirmation.rejectLabel ?? "No"}
        </Button>
        <Button severity="danger" onClick={() => close(confirmation.accept)}>
          {confirmation.acceptLabel ?? "Yes"}
        </Button>
      </>
    );
  }, [confirmation]);

  return (
    <Dialog
      visible={Boolean(confirmation)}
      onHide={() => {
        confirmation?.reject?.();
        setConfirmation(null);
      }}
      header={confirmation?.header ?? "Confirmation"}
      footer={actions}
      style={{ maxWidth: "32rem", width: "calc(100vw - 2rem)" }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: "0.75rem" }}>
        <FiAlertCircle aria-hidden />
        <span>{confirmation?.message}</span>
      </div>
    </Dialog>
  );
}

export const ConfirmDialog = ConfirmPopup;
