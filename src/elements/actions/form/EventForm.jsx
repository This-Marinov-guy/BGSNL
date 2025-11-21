import React, { useCallback, useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FileUpload } from "primereact/fileupload";
import { useHttpClient } from "../../../hooks/common/http-hook";
import Loader from "../../ui/loading/Loader";
import ImageInput from "../../inputs/common/ImageInput";
import { BG_INDEX, REGIONS } from "../../../util/defines/REGIONS_DESIGN";
import StringDynamicInputs from "../../inputs/common-complicated/StringDynamicInputs";
import InputsBuilder from "../../inputs/builders/InputsBuilder";
import {
  askBeforeRedirect,
  isPlainObject,
  isObjectEmpty,
  isProd,
} from "../../../util/functions/helpers";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import {
  EVENT_ADDED,
  EVENT_EDITED,
  INCORRECT_MISSING_DATA,
} from "../../../util/defines/common";
import LongLoading from "../../ui/loading/LongLoading";
import SubEventBuilder from "../../inputs/builders/SubEventBuilder";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import ConfirmCenterModal from "../../ui/modals/ConfirmCenterModal";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";
import { addEventToAll, editEventFromAll } from "../../../redux/events";
import ImageSelection from "../../inputs/ImageSelection";
import AdditionalPrices from "../../inputs/AdditionalPrices";
import { START_TIMER } from "../../../util/defines/enum";
import PromotionalPrices from "../../inputs/PromotionalPrice";
import AddOnsBuilder from "../../inputs/builders/AddOnsBuilder";
import PromoCodesBuilder from "../../inputs/builders/PromoCodesBuilder";
import { FiInfo } from "react-icons/fi";
import { Tooltip } from "primereact/tooltip";

const EventForm = (props) => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [visible, setVisible] = useState(false);
  const [confirmResolver, setConfirmResolver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [isValidFiles, setIsValidFiles] = useState(true);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { eventId } = useParams();

  const edit = props.edit;
  const initialData = edit ? props.initialData : null;
  const bgs = Array.from({ length: BG_INDEX }, (_, i) => ({
    src: `/assets/images/bg/bg-image-${i + 1}.webp`,
    value: i + 1,
  }));
  const validFileTypes = ["image/jpg", "image/jpeg", "image/png"];

  const preSubmitCheck = (errors) => {
    if (!isProd()) {
      console.log(errors);
    }

    if (!isObjectEmpty(errors)) {
      return dispatch(showNotification(INCORRECT_MISSING_DATA));
    }
  };

  const inputHandler = (event) => {
    const pickedFiles = Array.from(event.target.files);
    const filteredFiles = pickedFiles.filter((file) =>
      validFileTypes.includes(file.type)
    );

    if (filteredFiles.length > 0) {
      setFiles(filteredFiles);
      setIsValidFiles(true);
    } else {
      setIsValidFiles(false);
    }
  };

  const isImageCorrectRatio = (file, margin = 0.01) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (Math.abs(width / height - 1500 / 485) < margin) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = useCallback(() => {
    if (confirmResolver) {
      confirmResolver();
      setConfirmResolver(null);
      setVisible(false);
    }
  }, [confirmResolver]);

  const waitForConfirmation = () => {
    return new Promise((resolve) => {
      setVisible(true);
      setConfirmResolver(() => resolve);
    });
  };

  useEffect(() => {
    askBeforeRedirect();
  }, []);

  const schema = yup.object().shape({
    region: yup.string().required("Region is required"),
    title: yup.string().required("Title is required"),
    description: yup.string(),
    date: yup.string().required("Date is required"),
    location: yup.string().required("Location is required"),
    ticketTimer: yup.string().required("Ticket Timer is required"),
    ticketLimit: yup
      .number()
      .required("Ticket Limit is required")
      .min(1, "Must be greater than 0"),
    isFree: yup.bool(),
    isMemberFree: yup.bool(),
    memberOnly: yup.bool(),
    isTicketLink: yup.bool(),

    guestPrice: yup.number().when(["isFree", "isTicketLink"], {
      is: (isFree, isTicketLink) => isFree || isTicketLink,
      then: () => yup.number().nullable(),
      otherwise: () =>
        yup
          .number()
          .required("Guest Price is required")
          .min(1, "Must be greater than 0"),
    }),

    memberPrice: yup
      .number()
      .when(["isFree", "isMemberFree", "memberOnly", "isTicketLink"], {
        is: (isFree, isMemberFree, memberOnly, isTicketLink) =>
          (isFree || isMemberFree) && !memberOnly && !isTicketLink,
        then: () => yup.number().nullable(),
        otherwise: () =>
          yup
            .number()
            .required("Member Price is required")
            .min(1, "Must be greater than 0"),
      }),

    activeMemberPrice: yup.number().min(1, "Must be greater than 0").nullable(),

    earlyBird: yup
      .object()
      .shape({
        isEnabled: yup.boolean().required(),
        price: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required(
                "Early Bird Price is required when Early Bird is enabled"
              )
              .min(1, "Must be greater than 0"),
          otherwise: () => yup.number().nullable(),
        }),
        memberPrice: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required(
                "Early Bird Member Price is required when Early Bird is enabled"
              )
              .min(1, "Must be greater than 0"),
          otherwise: () => yup.number().nullable(),
        }),
        ticketLimit: yup.number().nullable().min(1, "Must be greater than 0"),
        ticketTimer: yup.string().nullable(),
        excludeMembers: yup.boolean(),
      })
      .test(
        "at-least-one-limit",
        "Either Ticket Limit or Ticket Timer must be provided when Early Bird is enabled",
        function (value) {
          const { isEnabled, ticketLimit, ticketTimer } = value;
          if (!isEnabled) return true;

          const hasValidLimit = ticketLimit != null && ticketLimit > 0;
          const hasValidTimer = ticketTimer != null && ticketTimer !== "";

          if (!hasValidLimit && !hasValidTimer) {
            return this.createError({
              path: "earlyBird.at-least-one-limit",
              message:
                "Either Ticket Limit or Ticket Timer must be provided when Early Bird is enabled",
            });
          }

          return true;
        }
      ),

    lateBird: yup
      .object()
      .shape({
        isEnabled: yup.boolean().required(),
        price: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required("Late Bird Price is required when Late Bird is enabled")
              .min(1, "Must be greater than 0"),
          otherwise: () => yup.number().nullable(),
        }),
        memberPrice: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required(
                "Late Bird Member Price is required when Late Bird is enabled"
              )
              .min(1, "Must be greater than 0"),
          otherwise: () => yup.number().nullable(),
        }),
        ticketLimit: yup.number().nullable().min(1, "Must be greater than 0"),
        startTimer: yup.string().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .string()
              .required(
                "Late Bird Start Timer is required when Late Bird is enabled"
              ),
          otherwise: () => yup.string().nullable(),
        }),
        excludeMembers: yup.boolean(),
      })
      .test(
        "at-least-one-limit",
        "Either Ticket Limit or Ticket Timer must be provided when Late Bird is enabled",
        function (value) {
          const { isEnabled, ticketLimit, startTimer } = value;
          if (!isEnabled) return true;

          const hasValidLimit = ticketLimit != null && ticketLimit > 0;
          const hasValidTimer = startTimer != null && startTimer !== "";

          if (!hasValidLimit && !hasValidTimer) {
            return this.createError({
              path: "lateBird.at-least-one-limit",
              message:
                "Either Ticket Limit or Ticket Timer must be provided when Late Bird is enabled",
            });
          }

          return true;
        }
      ),

    guestPromotion: yup.object().shape({
      isEnabled: yup.boolean().required(),
      discount: yup.number().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .number()
            .required("Please enter discount %")
            .min(5, "Must be at least 5%")
            .max(95, "Cannot exceed 95%"),
        otherwise: () => yup.number().nullable(),
      }),
      startTimer: yup.string().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .string()
            .required("Please enter a start point of the guest promotion"),
        otherwise: () => yup.string().nullable(),
      }),
      endTimer: yup.string().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .string()
            .required("Please enter an end point of the guest promotion"),
        otherwise: () => yup.string().nullable(),
      }),
    }),

    memberPromotion: yup.object().shape({
      isEnabled: yup.boolean().required(),
      discount: yup.number().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .number()
            .required("Please enter discount %")
            .min(5, "Must be at least 5%")
            .max(95, "Cannot exceed 95%"),
        otherwise: () => yup.number().nullable(),
      }),
      startTimer: yup.string().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .string()
            .required("Please enter a start point of the member promotion"),
        otherwise: () => yup.string().nullable(),
      }),
      endTimer: yup.string().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .string()
            .required("Please enter an end point of the member promotion"),
        otherwise: () => yup.string().nullable(),
      }),
    }),

    addOns: yup.object().shape({
      isEnabled: yup.boolean(),
      multi: yup.boolean(),
      isMandatory: yup.boolean(),
      title: yup.string().when("isEnabled", {
        is: true,
        then: () => yup.string().required("Add-ons main title is required"),
        otherwise: () => yup.string().nullable(),
      }),
      description: yup.string().nullable(),
      items: yup.array().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .array()
            .of(
              yup.object().shape({
                title: yup.string().required("Item title is required"),
                description: yup.string().nullable(),
                price: yup.number().nullable(),
              })
            )
            .min(1, "At least one add-on item is required"),
        otherwise: () => yup.array().nullable(),
      }),
    }),

    promoCodes: yup.object().shape({
      isEnabled: yup.boolean(),
      codes: yup.array().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .array()
            .of(
              yup.object().shape({
                id: yup.string().nullable(),
                code: yup.string().required("Promo code is required"),
                discountType: yup
                  .number()
                  .required("Discount type is required")
                  .oneOf([1, 2], "Must be 1 (fixed) or 2 (percentage)"),
                discount: yup
                  .number()
                  .required("Discount amount is required")
                  .when("discountType", {
                    is: 2,
                    then: () =>
                      yup
                        .number()
                        .min(1, "Percentage must be at least 1%")
                        .max(100, "Percentage cannot exceed 100%"),
                    otherwise: () =>
                      yup.number().min(0.01, "Amount must be greater than 0"),
                  }),
                useLimit: yup
                  .number()
                  .nullable()
                  .min(1, "Use limit must be at least 1"),
                timeLimit: yup.string().nullable(),
                minAmount: yup
                  .number()
                  .nullable()
                  .min(0.01, "Minimum amount must be greater than 0"),
                active: yup.boolean(),
              })
            )
            .min(1, "At least one promo code is required when enabled"),
        otherwise: () => yup.array().nullable(),
      }),
    }),

    ticketLink: yup.string().when("isTicketLink", {
      is: (isTicketLink) => isTicketLink,
      then: () =>
        yup.string().required("Link to the ticket platform is required"),
      otherwise: () => yup.string(),
    }),

    text: yup.string().required("Add some content to the event"),
    ticketImg: yup.mixed().required("A ticket image is required"),
    poster: yup.mixed().required("A poster is required"),
  });

  return (
    <>
      <ConfirmCenterModal
        text="Are you sure you want to submit the event?"
        onConfirm={onSubmit}
        visible={visible}
        setVisible={setVisible}
      />
      <LongLoading visible={submitting} />
      <Formik
        className="container"
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await waitForConfirmation();

            setSubmitting(true);
            forceStartLoading();

            const formData = new FormData();

            files.forEach((file, index) => {
              let fileName = "image_" + index;

              let readyFile = new File([file], fileName);
              formData.append(`images`, readyFile, fileName);
            });

            Object.entries(values).forEach(([key, val]) => {
              if (key === "promoCodes") {
                // Only send promoCodes array if enabled
                if (val.isEnabled && val.codes && val.codes.length > 0) {
                  // Filter out empty promo codes and format properly
                  const validPromoCodes = val.codes.filter(
                    (code) => code.code && code.code.trim() !== ""
                  );
                  if (validPromoCodes.length > 0) {
                    formData.append(key, JSON.stringify(validPromoCodes));
                  }
                }
              } else if (
                isPlainObject(val) ||
                ["extraInputsForm", "addOns"].includes(key)
              ) {
                formData.append(key, JSON.stringify(val));
              } else if (Array.isArray(val)) {
                val.forEach((v, i) => {
                  formData.append(`${key}[]`, v);
                });
              } else {
                formData.append(key, val);
              }
            });

            const responseData = props.edit
              ? await sendRequest(
                  `future-event/edit-event/${eventId}`,
                  "PATCH",
                  formData
                )
              : await sendRequest("future-event/add-event", "POST", formData);

            if (responseData.status) {
              navigate("/user/dashboard");
              dispatch(
                showNotification(props.edit ? EVENT_EDITED : EVENT_ADDED)
              );
              dispatch(
                props.edit
                  ? editEventFromAll(responseData.event)
                  : addEventToAll(responseData.event)
              );
            }
          } catch (err) {
          } finally {
            setSubmitting(false);
          }
        }}
        initialValues={{
          memberOnly: initialData?.memberOnly ?? false,
          hidden: initialData?.hidden ?? false,
          extraInputsForm: initialData?.extraInputsForm ?? [],
          freePass: initialData?.freePass ?? [],
          discountPass: initialData?.discountPass ?? [],
          subEvent: initialData?.subEvent ?? null,
          region: initialData?.region ?? "",
          title: initialData?.title ?? "",
          description: initialData?.description ?? "",
          date: initialData?.date ?? "",
          location: initialData?.location ?? "",
          ticketLimit: initialData?.ticketLimit ?? "",
          ticketTimer: initialData?.ticketTimer ?? "",
          isTicketLink: initialData?.isTicketLink ?? false,
          isSaleClosed: initialData?.isSaleClosed ?? false,
          isFree: initialData?.isFree ?? false,
          isMemberFree: initialData?.isMemberFree ?? false,
          guestPrice:
            initialData?.product?.guest?.price !== undefined &&
            !isNaN(initialData.product.guest.price)
              ? initialData.product.guest.price
              : undefined,
          memberPrice:
            initialData?.product?.member?.price !== undefined &&
            !isNaN(initialData.product.member.price)
              ? initialData.product.member.price
              : undefined,
          activeMemberPrice:
            initialData?.product?.activeMember?.price !== undefined &&
            !isNaN(initialData.product.activeMember.price)
              ? initialData.product.activeMember.price
              : undefined,
          entryIncluding: initialData?.entryIncluding ?? "",
          memberIncluding: initialData?.memberIncluding ?? "",
          ticketLink: initialData?.ticketLink ?? "",
          text: initialData?.text ?? "",
          images: initialData?.images ?? [],
          ticketImg: initialData?.ticketImg ?? null,
          ticketColor: initialData?.ticketColor ?? "#faf9f6",
          ticketQR: `${initialData?.ticketQR ?? false}`,
          ticketName: `${initialData?.ticketName ?? true}`,
          poster: initialData?.poster ?? null,
          bgImage: initialData?.bgImage ?? 1,
          bgImageExtra: initialData?.bgImageExtra ?? null,
          bgImageSelection: initialData?.bgImageSelection ?? 1,
          earlyBird: {
            ticketLimit:
              initialData?.earlyBird?.ticketLimit !== undefined &&
              !isNaN(initialData.earlyBird.ticketLimit)
                ? initialData.earlyBird.ticketLimit
                : undefined,
            ticketTimer: initialData?.earlyBird?.ticketTimer ?? "",
            price:
              initialData?.earlyBird?.price !== undefined &&
              !isNaN(initialData.earlyBird.price)
                ? initialData.earlyBird.price
                : undefined,
            memberPrice:
              initialData?.earlyBird?.memberPrice !== undefined &&
              !isNaN(initialData.earlyBird.memberPrice)
                ? initialData.earlyBird.memberPrice
                : undefined,
            isEnabled: initialData?.earlyBird?.isEnabled ?? false,
            excludeMembers: initialData?.earlyBird?.excludeMembers ?? false,
          },
          lateBird: {
            ticketLimit:
              initialData?.lateBird?.ticketLimit !== undefined &&
              !isNaN(initialData.lateBird.ticketLimit)
                ? initialData.lateBird.ticketLimit
                : undefined,
            startTimer: initialData?.lateBird?.startTimer ?? "",
            price:
              initialData?.lateBird?.price !== undefined &&
              !isNaN(initialData.lateBird.price)
                ? initialData.lateBird.price
                : undefined,
            memberPrice:
              initialData?.lateBird?.memberPrice !== undefined &&
              !isNaN(initialData.lateBird.memberPrice)
                ? initialData.lateBird.memberPrice
                : undefined,
            isEnabled: initialData?.lateBird?.isEnabled ?? false,
            excludeMembers: initialData?.lateBird?.excludeMembers ?? false,
          },
          guestPromotion: {
            isEnabled: initialData?.promotion?.guest?.isEnabled ?? false,
            startTimer: initialData?.promotion?.guest?.startTimer ?? "",
            endTimer: initialData?.promotion?.guest?.endTimer ?? "",
            discount:
              initialData?.promotion?.guest?.discount !== undefined &&
              !isNaN(initialData.promotion.guest.discount)
                ? initialData.promotion.guest.discount
                : undefined,
          },
          memberPromotion: {
            isEnabled: initialData?.promotion?.member?.isEnabled ?? false,
            startTimer: initialData?.promotion?.member?.startTimer ?? "",
            endTimer: initialData?.promotion?.member?.endTimer ?? "",
            discount:
              initialData?.promotion?.member?.discount !== undefined &&
              !isNaN(initialData.promotion.member.discount)
                ? initialData.promotion.member.discount
                : undefined,
          },
          addOns: {
            isEnabled: initialData?.addOns?.isEnabled ?? false,
            isMandatory: initialData?.addOns?.isMandatory ?? false,
            multi: initialData?.addOns?.multi ?? false,
            title: initialData?.addOns?.title ?? "",
            description: initialData?.addOns?.description ?? "",
            items:
              initialData?.addOns?.items && initialData.addOns.items.length > 0
                ? initialData.addOns.items
                : [{ title: "", description: "", price: undefined }],
          },
          promoCodes: {
            isEnabled: initialData?.product.promoCodes?.length > 0,
            codes:
              initialData?.product?.promoCodes?.length > 0
                ? initialData?.product?.promoCodes?.map((code) => ({
                    ...code,
                    active: code.active !== undefined ? code.active : true,
                  }))
                : [
                    {
                      code: "",
                      discountType: 2,
                      discount: undefined,
                      useLimit: undefined,
                      timeLimit: "",
                      minAmount: undefined,
                      active: true,
                    },
                  ],
          },
        }}
      >
        {({ values, setFieldValue, errors, isValid, dirty }) => (
          <Form
            encType="multipart/form-data"
            id="form"
            style={{ padding: "2%" }}
          >
            {/* ========== REQUIRED SECTIONS ========== */}
            <div
              style={{
                backgroundColor: "#fff9f0",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #ffc107",
                marginBottom: "40px",
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", marginBottom: "20px" }}
              >
                <h2 style={{ margin: 0, color: "#dc3545", fontSize: "24px" }}>
                  Required Information
                </h2>
                <small style={{ color: "#6c757d", fontStyle: "italic" }}>
                  All fields marked with * are mandatory
                </small>
              </div>

              <h3 className="label">Basic Information</h3>
              <div className="row">
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                      }}
                    >
                      Region <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Field disabled={props.edit} as="select" name="region">
                      <option value="" disabled>
                        Select Region
                      </option>
                      {REGIONS.map((val, index) => {
                        return (
                          <option value={val} key={index}>
                            {capitalizeFirstLetter(val, true)}
                          </option>
                        );
                      })}
                    </Field>
                    <ErrorMessage
                      className="error"
                      name="region"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                      }}
                    >
                      Location <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Field
                      type="text"
                      placeholder="e.g., De Nieuwe Kantine, Amsterdam"
                      name="location"
                    ></Field>
                    <ErrorMessage
                      className="error"
                      name="location"
                      component="div"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                      }}
                    >
                      Event Name <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Field
                      type="text"
                      placeholder="e.g., Summer Beach Party 2024"
                      name="title"
                    ></Field>
                    <ErrorMessage
                      className="error"
                      name="title"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                        color: "#6c757d",
                      }}
                    >
                      Sub-Title
                    </label>
                    <Field
                      type="text"
                      placeholder="e.g., An unforgettable night by the sea"
                      name="description"
                    ></Field>
                    <ErrorMessage
                      className="error"
                      name="description"
                      component="div"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                      }}
                    >
                      Date and Time <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <CalendarWithClock
                      mode="single"
                      locale="en-nl"
                      placeholder="Select event date and time"
                      captionLayout="dropdown"
                      initialValue={values.date}
                      min={new Date()}
                      onSelect={(value) => {
                        setFieldValue("date", value);
                      }}
                    />
                    <ErrorMessage
                      className="error"
                      name="date"
                      component="div"
                    />
                  </div>
                </div>
              </div>
              <div className="row mt--20">
                <div className="col-lg-12 col-md-12 col-12">
                  <div className="rn-form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "5px",
                      }}
                    >
                      Full Description{" "}
                      <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Field
                      as="textarea"
                      placeholder="Describe your event in detail..."
                      name="text"
                      rows={6}
                    />
                    <ErrorMessage
                      className="error"
                      name="text"
                      component="div"
                    />
                  </div>
                </div>
              </div>
              <h3 className="mt--30 label">Price Details</h3>
              <div className="row">
                <div className="col-lg-4 col-12">
                  <div className="hor_section_nospace mt--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="isFree"
                    ></Field>
                    <p className="information">Make event FREE for all</p>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="hor_section_nospace mt--20 mb--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="isMemberFree"
                    ></Field>
                    <p className="information">
                      Make event FREE for members only
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="hor_section_nospace mt--20 mb--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="isTicketLink"
                    ></Field>
                    <p className="information">
                      Buy tickets from external platform (outside the website)
                    </p>
                  </div>
                </div>
              </div>
              {!(values.isSaleClosed || values.isFree) &&
                (values.isTicketLink ? (
                  <div className="row">
                    <div className="col-12">
                      <div className="rn-form-group">
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "5px",
                          }}
                        >
                          External Platform Ticket Link{" "}
                          <span style={{ color: "#dc3545" }}>*</span>
                        </label>
                        <Field
                          type="text"
                          placeholder="e.g., https://ticketmaster.com/event/12345"
                          name="ticketLink"
                        />
                        <small style={{ color: "#6c757d" }}>
                          Link will redirect users to external ticket platform
                        </small>
                        <ErrorMessage
                          className="error"
                          name="ticketLink"
                          component="div"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-lg-4 col-md-6 col-12">
                      <h5 className="mt--10">Basic Price</h5>
                      <div className="rn-form-group">
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "5px",
                          }}
                        >
                          Guest Price (€){" "}
                          <span style={{ color: "#dc3545" }}>*</span>
                        </label>
                        <Field
                          type="number"
                          placeholder="e.g., 15.00"
                          name="guestPrice"
                          min={1}
                          step="0.01"
                        />
                        <ErrorMessage
                          className="error"
                          name="guestPrice"
                          component="div"
                        />
                      </div>
                      <div className="rn-form-group">
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "5px",
                            color: "#6c757d",
                          }}
                        >
                          Including
                        </label>
                        <Field
                          type="text"
                          placeholder="e.g., 2 drinks, coat check"
                          name="entryIncluding"
                        />
                        <ErrorMessage
                          className="error"
                          name="entryIncluding"
                          component="div"
                        />
                      </div>
                    </div>
                    {!values.isMemberFree && (
                      <>
                        <div className="col-lg-4 col-md-6 col-12">
                          <h5 className="mt--10">Member Price</h5>
                          <div className="rn-form-group">
                            <label
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "5px",
                              }}
                            >
                              Member Price (€){" "}
                              <span style={{ color: "#dc3545" }}>*</span>
                            </label>
                            <Field
                              type="number"
                              placeholder="e.g., 10.00"
                              name="memberPrice"
                              min={1}
                              step="0.01"
                            />
                            <ErrorMessage
                              className="error"
                              name="memberPrice"
                              component="div"
                            />
                          </div>
                          <div className="rn-form-group">
                            <label
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "5px",
                                color: "#6c757d",
                              }}
                            >
                              Including
                            </label>
                            <Field
                              type="text"
                              placeholder="e.g., 3 drinks, coat check"
                              name="memberIncluding"
                            />
                            <ErrorMessage
                              className="error"
                              name="memberIncluding"
                              component="div"
                            />
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                          <h5 className="mt--10">Active Member Price</h5>
                          <div className="rn-form-group">
                            <label
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "5px",
                                color: "#6c757d",
                              }}
                            >
                              Active Member Price (€)
                            </label>
                            <Field
                              type="number"
                              placeholder="e.g., 8.00"
                              name="activeMemberPrice"
                              min={1}
                              step="0.01"
                            />
                            <ErrorMessage
                              className="error"
                              name="activeMemberPrice"
                              component="div"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              <h3 className="mt--30 label">Images</h3>
              <div className="row">
                <div className="col-lg-4 col-md-6 col-12 mt--20">
                  <div
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <hr />
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ gap: "8px" }}
                    >
                      <h5 className="center_text" style={{ margin: 0 }}>
                        Poster Image <span style={{ color: "#dc3545" }}>*</span>
                      </h5>
                      <Tooltip target=".poster-tooltip" />
                      <FiInfo
                        className="poster-tooltip"
                        style={{ cursor: "help", color: "#6c757d" }}
                        data-pr-tooltip="Main promotional image for your event (displayed on event page)"
                        data-pr-position="right"
                      />
                    </div>
                    <ImageInput
                      initialImage={values.poster}
                      onChange={(event) => {
                        setFieldValue("poster", event.target.files[0]);
                      }}
                    />
                    <ErrorMessage
                      className="error center_div"
                      name="poster"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mt--20">
                  <div
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <hr />
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ gap: "8px" }}
                    >
                      <h5 className="center_text" style={{ margin: 0 }}>
                        Ticket Image <span style={{ color: "#dc3545" }}>*</span>
                      </h5>
                      <Tooltip target=".ticket-img-tooltip" />
                      <FiInfo
                        className="ticket-img-tooltip"
                        style={{ cursor: "help", color: "#6c757d" }}
                        data-pr-tooltip="Background image for digital tickets (must be 300:97 ratio, e.g., 1500x485px)"
                        data-pr-position="right"
                      />
                    </div>
                    <ImageInput
                      initialImage={values.ticketImg}
                      onChange={(event) => {
                        isImageCorrectRatio(event.target.files[0], 0.02)
                          .then((isCorrect) => {
                            if (isCorrect) {
                              setFieldValue("ticketImg", event.target.files[0]);
                            } else {
                              dispatch(
                                showNotification({
                                  severity: "warn",
                                  detail:
                                    "Image is not the correct ration and will not be uploaded - please choose another image!",
                                })
                              );
                            }
                          })
                          .catch((error) => {
                            dispatch(
                              showNotification({
                                severity: "danger",
                                detail:
                                  "Error uploading the image - please try again!",
                              })
                            );
                          });
                      }}
                    />
                    <p className="mt--10 information center_text">
                      *ticket must be jpg or png in resolution 300:97 (like 1500
                      x 485)
                    </p>
                    <ErrorMessage
                      className="error center_div"
                      name="ticketImg"
                      component="div"
                    />
                    <div className="row" style={{justifyContent: "start", alignItems: "start"}}>
                      <div
                        className="col-lg-4 col-md-6 col-6"
                        style={{ margin: "auto" }}
                      >
                        <h5 className="center_text">Name on ticket color</h5>
                        <div className="center_div_col">
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketColor"
                              value="#faf9f6"
                            />
                            Light
                          </p>
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketColor"
                              value="#272528"
                            />
                            Dark
                          </p>
                        </div>
                      </div>
                      <div
                        className="col-lg-4 col-md-6 col-6"
                        style={{ margin: "auto" }}
                      >
                        <h5 className="center_text">With Guest Name</h5>
                        <div className="center_div_col">
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketName"
                              value={"true"}
                            />
                            Yes
                          </p>
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketName"
                              value={"false"}
                            />
                            No
                          </p>
                        </div>
                      </div>
                      <div
                        className="col-lg-4 col-md-6 col-6"
                        style={{ margin: "auto" }}
                      >
                        <h5 className="center_text">With QR</h5>
                        <div className="center_div_col">
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketQR"
                              value={"true"}
                            />
                            Yes
                          </p>
                          <p className="center_div">
                            <Field
                              type="radio"
                              name="ticketQR"
                              value={"false"}
                            />
                            No
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mt--20">
                  <div
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <hr />
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ gap: "8px" }}
                    >
                      <h5 className="center_text" style={{ margin: 0 }}>
                        Background Image{" "}
                        <span style={{ color: "#dc3545" }}>*</span>
                      </h5>
                      <Tooltip target=".bg-image-tooltip" />
                      <FiInfo
                        className="bg-image-tooltip"
                        style={{ cursor: "help", color: "#6c757d" }}
                        data-pr-tooltip="Choose a background image for the event page (default or custom)"
                        data-pr-position="right"
                      />
                    </div>
                    <div
                      className="rn-form-group"
                      style={{ margin: "auto", width: "250px" }}
                    >
                      <ImageSelection
                        placeholder="Choose default background"
                        initialValue={values.bgImage}
                        onSelect={(option) => setFieldValue("bgImage", option)}
                        options={bgs}
                      />
                      <h5>or choose your own</h5>
                      <ImageInput
                        initialImage={values.bgImageExtra}
                        style={{ height: "150px" }}
                        onChange={(event) => {
                          setFieldValue("bgImageExtra", event.target.files[0]);
                          setFieldValue("bgImageSelection", 2);
                        }}
                      />
                      <p className="mt--10 information center_text">
                        *choose a wide one
                      </p>
                      {values.bgImage && values.bgImageExtra && (
                        <div className="col-12" style={{ margin: "auto" }}>
                          <h5 className="center_text">
                            Select which one to display
                          </h5>
                          <div className="center_div" style={{ gap: "50px" }}>
                            <p className="center_div">
                              <Field
                                type="radio"
                                name="bgImageSelection"
                                value={1}
                              />
                              Default Backgrounds
                            </p>
                            <p className="center_div">
                              <Field
                                type="radio"
                                name="bgImageSelection"
                                value={2}
                              />
                              Extra Background
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="label mt--20">Ticket Settings</h3>
              <div className="row">
                <div className="col-lg-6 col-12">
                  <div className="rn-form-group">
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "8px", marginBottom: "5px" }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        Ticket Limit <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <Tooltip target=".ticket-limit-tooltip" />
                      <FiInfo
                        className="ticket-limit-tooltip"
                        style={{ cursor: "help", color: "#6c757d" }}
                        data-pr-tooltip="Maximum number of tickets available for sale"
                        data-pr-position="right"
                      />
                    </div>
                    <Field
                      type="number"
                      placeholder="e.g., 100"
                      name="ticketLimit"
                      min={1}
                      step={1}
                    />
                    <ErrorMessage
                      className="error"
                      name="ticketLimit"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-12">
                  <div className="rn-form-group">
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "8px", marginBottom: "5px" }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        Ticket Timer <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <Tooltip target=".ticket-timer-tooltip" />
                      <FiInfo
                        className="ticket-timer-tooltip"
                        style={{ cursor: "help", color: "#6c757d" }}
                        data-pr-tooltip="Deadline for ticket sales (sales stop at this date/time)"
                        data-pr-position="right"
                      />
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <CalendarWithClock
                          mode="single"
                          locale="en-nl"
                          placeholder="Select ticket sales deadline"
                          captionLayout="dropdown"
                          min={values.date ? new Date(values.date) : new Date()}
                          initialValue={values.ticketTimer}
                          onSelect={(value) => {
                            setFieldValue("ticketTimer", value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <ErrorMessage
                    className="error"
                    name="ticketTimer"
                    component="div"
                  />
                </div>
              </div>
            </div>
            {/* End of Required Sections */}

            {/* ========== OPTIONAL SECTIONS ========== */}
            <div
              style={{
                backgroundColor: "#f0f8ff",
                padding: "20px",
                borderRadius: "8px",
                border: "2px dashed #17a2b8",
                marginBottom: "40px",
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", marginBottom: "20px" }}
              >
                <h2 style={{ margin: 0, color: "#17a2b8", fontSize: "24px" }}>
                  Optional Settings
                </h2>
                <small style={{ color: "#6c757d", fontStyle: "italic" }}>
                  Customize your event with these additional options
                </small>
              </div>

              <div className="row">
                <div className="col-lg-6 col-12 mt--20">
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "8px", marginBottom: "10px" }}
                  >
                    <h5 style={{ margin: 0, color: "#6c757d" }}>
                      Discount Emails
                    </h5>
                    <Tooltip target=".discount-emails-tooltip" />
                    <FiInfo
                      className="discount-emails-tooltip"
                      style={{ cursor: "help", color: "#6c757d" }}
                      data-pr-tooltip="Email addresses that receive member pricing (in addition to active members)"
                      data-pr-position="right"
                    />
                  </div>
                  <StringDynamicInputs
                    name="discountPass"
                    onChange={(inputs) => setFieldValue("discountPass", inputs)}
                    initialValues={values.discountPass}
                    placeholder="e.g., guest@example.com"
                  />
                </div>
                <div className="col-lg-6 col-12 mt--20">
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "8px", marginBottom: "10px" }}
                  >
                    <h5 style={{ margin: 0, color: "#6c757d" }}>
                      Free Pass Emails
                    </h5>
                    <Tooltip target=".freepass-emails-tooltip" />
                    <FiInfo
                      className="freepass-emails-tooltip"
                      style={{ cursor: "help", color: "#6c757d" }}
                      data-pr-tooltip="Email addresses that can register for free (e.g., sponsors, VIPs)"
                      data-pr-position="right"
                    />
                  </div>
                  <StringDynamicInputs
                    name="freePass"
                    onChange={(inputs) => setFieldValue("freePass", inputs)}
                    initialValues={values.freePass}
                    placeholder="e.g., vip@example.com"
                  />
                </div>
              </div>

              <h3 className="label mt--40">Manage Sales</h3>
              <div className="row mt--20">
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="hor_section_nospace mt--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="isSaleClosed"
                    ></Field>
                    <p className="information">
                      Close Sale of Tickets (only display event)
                    </p>
                    <Tooltip target=".sale-closed-tooltip" />
                    <FiInfo
                      className="sale-closed-tooltip"
                      style={{
                        marginLeft: "8px",
                        cursor: "help",
                        color: "#6c757d",
                      }}
                      data-pr-tooltip="Disable ticket purchases but keep event visible for information"
                      data-pr-position="right"
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="hor_section_nospace mt--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="memberOnly"
                    ></Field>
                    <p className="information">
                      Make event only purchasable by members
                    </p>
                    <Tooltip target=".member-only-tooltip" />
                    <FiInfo
                      className="member-only-tooltip"
                      style={{
                        marginLeft: "8px",
                        cursor: "help",
                        color: "#6c757d",
                      }}
                      data-pr-tooltip="Only members can purchase tickets (event still visible to non-members)"
                      data-pr-position="right"
                    />
                  </div>
                  <ErrorMessage
                    className="error"
                    name="memberOnly"
                    component="div"
                  />
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="hor_section_nospace mt--20">
                    <Field
                      style={{ maxWidth: "30px" }}
                      type="checkbox"
                      name="hidden"
                    ></Field>
                    <p className="information">Hide event from News section</p>
                    <Tooltip target=".hidden-event-tooltip" />
                    <FiInfo
                      className="hidden-event-tooltip"
                      style={{
                        marginLeft: "8px",
                        cursor: "help",
                        color: "#6c757d",
                      }}
                      data-pr-tooltip="Event only accessible via direct URL or subevent link (not shown in listings)"
                      data-pr-position="right"
                    />
                  </div>
                  <ErrorMessage
                    className="error"
                    name="hidden"
                    component="div"
                  />
                </div>
              </div>

              <h3 className="label mt--40">Extra Images</h3>
              <div className="row center_text">
                <div className="col-12 mt--20">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ gap: "8px", marginBottom: "10px" }}
                  >
                    <h5 style={{ margin: 0, color: "#6c757d" }}>
                      Extra Description Images
                    </h5>
                    <Tooltip target=".extra-images-tooltip" />
                    <FiInfo
                      className="extra-images-tooltip"
                      style={{ cursor: "help", color: "#6c757d" }}
                      data-pr-tooltip="Additional images to display at the bottom of the event page (poster is already included)"
                      data-pr-position="right"
                    />
                  </div>
                  <FileUpload
                    name="extraImages"
                    onInput={inputHandler}
                    multiple
                    accept="image/*"
                    maxFileSize={100000000000}
                    emptyTemplate={
                      <h4 className="m-0">
                        Drag and drop files to here to upload.
                      </h4>
                    }
                  />
                  <p>
                    <small>* Submit no more than 3</small>
                    <br />
                    <small>* Any extra images will not be received</small>
                    <br />
                  </p>
                  {!isValidFiles && (
                    <p style={{ color: "red" }}>
                      The file is not supported, please try again
                    </p>
                  )}
                </div>
              </div>

              <h3 className="label mt--40">Variable Price Options</h3>
              <small
                style={{
                  color: "#6c757d",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                Change price based on demand and time
              </small>

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="earlyBird.isEnabled"
                ></Field>
                <p>Add Early Bird Price</p>
                <Tooltip target=".early-bird-tooltip" />
                <FiInfo
                  className="early-bird-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Discounted pricing for early ticket purchases. Set either a ticket limit or end date."
                  data-pr-position="right"
                />
              </div>
              <AdditionalPrices
                visible={values.earlyBird.isEnabled}
                label="Early Bird"
                setFieldValue={setFieldValue}
                initialCalendarValue={values.earlyBird.ticketTimer}
              />

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="lateBird.isEnabled"
                ></Field>
                <p>Add Late Bird Price</p>
                <Tooltip target=".late-bird-tooltip" />
                <FiInfo
                  className="late-bird-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Increased pricing that activates closer to the event date. Requires a start date."
                  data-pr-position="right"
                />
              </div>
              <AdditionalPrices
                visible={values.lateBird.isEnabled}
                label="Late Bird"
                setFieldValue={setFieldValue}
                initialCalendarValue={values.lateBird.startTimer}
                timerType={START_TIMER}
              />

              <h3 className="label mt--40">Promotions</h3>
              <small
                style={{
                  color: "#6c757d",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                Deduct % from the price
              </small>

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="guestPromotion.isEnabled"
                ></Field>
                <p>Add Guest Promotion</p>
                <Tooltip target=".guest-promo-tooltip" />
                <FiInfo
                  className="guest-promo-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Time-limited percentage discount for guest tickets. Set start and end dates."
                  data-pr-position="right"
                />
              </div>
              <PromotionalPrices
                visible={values.guestPromotion.isEnabled}
                label="Guest Promotion"
                setFieldValue={setFieldValue}
                initialStartValue={values.guestPromotion.startTimer}
                initialEndValue={values.guestPromotion.endTimer}
              />

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="memberPromotion.isEnabled"
                ></Field>
                <p>Add Member Promotion</p>
                <Tooltip target=".member-promo-tooltip" />
                <FiInfo
                  className="member-promo-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Time-limited percentage discount for member tickets. Set start and end dates."
                  data-pr-position="right"
                />
              </div>
              <PromotionalPrices
                visible={values.memberPromotion.isEnabled}
                label="Member Promotion"
                setFieldValue={setFieldValue}
                initialStartValue={values.memberPromotion.startTimer}
                initialEndValue={values.memberPromotion.endTimer}
              />

              <h3 className="label mt--40">Add-Ons</h3>
              <small
                style={{
                  color: "#6c757d",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                Additional services or products to the ticket
              </small>

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="addOns.isEnabled"
                ></Field>
                <p>Enable add-ons</p>
                <Tooltip target=".addons-tooltip" />
                <FiInfo
                  className="addons-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Extra items customers can purchase with their ticket (e.g., drinks, merchandise, food)."
                  data-pr-position="right"
                />
              </div>
              <AddOnsBuilder
                onChange={(input) => setFieldValue("addOns", input)}
                value={values.addOns}
              />

              <h3 className="label mt--40">Promo Codes</h3>
              <small
                style={{
                  color: "#6c757d",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                Discount codes customers can apply
              </small>

              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="promoCodes.isEnabled"
                ></Field>
                <p>Enable promo codes</p>
                <Tooltip target=".promocodes-tooltip" />
                <FiInfo
                  className="promocodes-tooltip"
                  style={{
                    marginLeft: "8px",
                    cursor: "help",
                    color: "#6c757d",
                  }}
                  data-pr-tooltip="Create custom discount codes for customers to use at checkout."
                  data-pr-position="right"
                />
              </div>
              <PromoCodesBuilder
                onChange={(codes) => setFieldValue("promoCodes.codes", codes)}
                value={values.promoCodes.codes}
                isEnabled={values.promoCodes.isEnabled}
              />

              <SubEventBuilder
                onChange={(input) => setFieldValue("subEvent", input)}
                initialValues={values.subEvent}
              />

              <h3 className="label mt--40">Add extra inputs by your choice</h3>
              <InputsBuilder
                onChange={(inputs) => setFieldValue("extraInputsForm", inputs)}
                initialValues={values.extraInputsForm}
              />
            </div>
            {/* End of Optional Sections */}

            <ConfirmDialog />
            <div className="mt--40 mb--20 center_div">
              <button
                onClick={() => navigate("/user/dashboard")}
                className="rn-button-style--2 rn-btn-reverse mr--5"
              >
                Dashboard
              </button>
              <button
                disabled={loading}
                type="submit"
                onClick={() => preSubmitCheck(errors, isValid, dirty)}
                className="rn-button-style--2 rn-btn-reverse-green"
              >
                {loading ? (
                  <Loader />
                ) : (
                  <span>{props.edit ? "Edit Event" : "Submit Event"}</span>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EventForm;
