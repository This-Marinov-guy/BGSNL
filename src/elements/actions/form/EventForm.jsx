import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import * as yup from "yup";
import {
  ConfirmDialog,
  Tooltip,
} from "@/compat/primereact";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
  useParams,
} from "@/util/navigation";
import { useHttpClient } from "../../../hooks/common/http-hook";
import {
  addEventToAll,
  editEventFromAll,
} from "../../../redux/events";
import { showNotification } from "../../../redux/notification";
import { selectUser } from "../../../redux/user";
import {
  ACCESS_2,
  EVENT_ADDED,
  EVENT_DRAFT,
  EVENT_DRAFT_SAVED,
  EVENT_EDITED,
} from "../../../util/defines/common";
import { START_TIMER } from "../../../util/defines/enum";
import {
  ADMIN_EVENT_REGIONS,
  BG_INDEX,
  REGIONS,
} from "../../../util/defines/REGIONS_DESIGN";
import { decodeJWT } from "../../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import {
  askBeforeRedirect,
  hasOverlap,
  isPlainObject,
} from "../../../util/functions/helpers";
import AdditionalPrices from "../../inputs/AdditionalPrices";
import AddOnsBuilder from "../../inputs/builders/AddOnsBuilder";
import InputsBuilder from "../../inputs/builders/InputsBuilder";
import PromoCodesBuilder from "../../inputs/builders/PromoCodesBuilder";
import SubEventBuilder from "../../inputs/builders/SubEventBuilder";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import ImageInput from "../../inputs/common/ImageInput";
import ImageSelection from "../../inputs/ImageSelection";
import MultiImageUpload from "../../inputs/MultiImageUpload";
import PromotionalPrices from "../../inputs/PromotionalPrice";
import ValidatedFormik from "../../ui/forms/ValidatedFormik";
import Loader from "../../ui/loading/Loader";
import LongLoading from "../../ui/loading/LongLoading";
import ConfirmCenterModal from "../../ui/modals/ConfirmCenterModal";

const EventForm = (props) => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [visible, setVisible] = useState(false);
  const [confirmResolver, setConfirmResolver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [extraImagesData, setExtraImagesData] = useState({
    existing: [],
    newFiles: [],
    all: []
  });
  const [extraImagesTouched, setExtraImagesTouched] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { eventId } = useParams();
  const roles = decodeJWT(user.token)?.roles ?? [];
  const regionOptions = hasOverlap(roles, ACCESS_2)
    ? ADMIN_EVENT_REGIONS
    : REGIONS;

  const edit = props.edit;
  const storedInitialData = edit ? props.initialData : null;
  const draftData =
    storedInitialData?.status === EVENT_DRAFT
      ? storedInitialData.draftData ?? {}
      : null;
  const initialData = draftData
    ? {
        ...storedInitialData,
        ...draftData,
        poster: storedInitialData.poster ?? draftData.poster ?? null,
        ticketImg: storedInitialData.ticketImg ?? draftData.ticketImg ?? null,
        bgImageExtra:
          storedInitialData.bgImageExtra ?? draftData.bgImageExtra ?? null,
        images: storedInitialData.images ?? draftData.images ?? [],
        product: {
          ...storedInitialData.product,
          guest: { price: draftData.guestPrice },
          member: { price: draftData.memberPrice },
          activeMember: { price: draftData.activeMemberPrice },
          promoCodes: draftData.promoCodes?.codes ?? [],
        },
        promotion: {
          guest: draftData.guestPromotion,
          member: draftData.memberPromotion,
        },
      }
    : storedInitialData;
  const bgs = Array.from({ length: BG_INDEX }, (_, i) => ({
    src: `/assets/images/bg/bg-image-${i + 1}.webp`,
    value: i + 1,
  }));

  const handleExtraImagesChange = (data) => {
    setExtraImagesData(data);
    setExtraImagesTouched(true);
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
    isSaleClosed: yup.bool(),

    guestPrice: yup.mixed().when(
      ["isSaleClosed", "isFree", "isTicketLink"],
      {
      is: (isSaleClosed, isFree, isTicketLink) =>
        isSaleClosed || isFree || isTicketLink,
      then: () => yup.mixed().nullable(),
      otherwise: () =>
        yup
          .number()
          .required("Guest Price is required")
          .min(1, "Must be greater than 0"),
      }
    ),

    memberPrice: yup
      .mixed()
      .when(["isSaleClosed", "isFree", "isMemberFree", "isTicketLink"], {
        is: (isSaleClosed, isFree, isMemberFree, isTicketLink) =>
          isSaleClosed || isFree || isMemberFree || isTicketLink,
        then: () => yup.mixed().nullable(),
        otherwise: () =>
          yup
            .number()
            .required("Member Price is required")
            .min(1, "Must be greater than 0"),
      }),

    activeMemberPrice: yup
      .mixed()
      .when(["isSaleClosed", "isFree", "isMemberFree", "isTicketLink"], {
        is: (isSaleClosed, isFree, isMemberFree, isTicketLink) =>
          isSaleClosed || isFree || isMemberFree || isTicketLink,
        then: () => yup.mixed().nullable(),
        otherwise: () =>
          yup.number().min(1, "Must be greater than 0").nullable(),
      }),

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

    ticketLink: yup
      .string()
      .when(["isSaleClosed", "isFree", "isTicketLink"], {
        is: (isSaleClosed, isFree, isTicketLink) =>
          !isSaleClosed && !isFree && isTicketLink,
        then: () =>
          yup
            .string()
            .url("Enter a valid ticket platform URL")
            .required("Link to the ticket platform is required"),
        otherwise: () => yup.string().nullable(),
      }),

    bgImage: yup
      .number()
      .integer("Choose a valid background image")
      .min(1, "Choose a valid background image")
      .max(BG_INDEX, "Choose a valid background image")
      .required("Choose a background image"),
    bgImageSelection: yup
      .number()
      .oneOf([1, 2], "Choose which background image to display")
      .required("Choose which background image to display"),

    subEvent: yup
      .object({
        description: yup.string().max(1000, "Description is too long"),
        links: yup
          .array()
          .max(50, "Too many related-event links")
          .of(
            yup.object({
              name: yup
                .string()
                .max(200, "Link name is too long")
                .test(
                  "paired-sub-event-name",
                  "Add a name for this link",
                  function (value) {
                    const href = String(this.parent?.href ?? "").trim();
                    return !href || Boolean(String(value ?? "").trim());
                  }
                ),
              href: yup
                .string()
                .max(2048, "Link is too long")
                .test(
                  "valid-sub-event-link",
                  "Enter a valid HTTP(S) link",
                  function (value) {
                    const name = String(this.parent?.name ?? "").trim();
                    const href = String(value ?? "").trim();
                    if (!name && !href) return true;
                    return Boolean(name) && /^https?:\/\/[^\s]+$/i.test(href);
                  }
                ),
            })
          ),
      })
      .nullable(),

    extraInputsForm: yup
      .array()
      .max(50, "Too many custom inputs")
      .of(
        yup.object({
          type: yup
            .string()
            .oneOf(["text", "select"], "Choose a valid input type")
            .required("Input type is required"),
          placeholder: yup
            .string()
            .trim()
            .max(200, "Question must not exceed 200 characters")
            .required("Question is required"),
          required: yup.boolean(),
          multiselect: yup.boolean(),
          options: yup.array().when("type", {
            is: "select",
            then: () =>
              yup
                .array()
                .max(100, "Too many options")
                .of(
                  yup
                    .string()
                    .trim()
                    .required("Options cannot be empty")
                )
                .min(1, "Add at least one option"),
            otherwise: () => yup.array().max(100, "Too many options"),
          }),
        })
      )
      .test(
        "unique-custom-input-questions",
        "Custom input questions must be unique",
        function (inputs) {
          const seen = new Set();

          for (let index = 0; index < (inputs?.length ?? 0); index += 1) {
            const question = String(inputs[index]?.placeholder ?? "")
              .trim()
              .toLocaleLowerCase();
            if (!question) continue;
            if (seen.has(question)) {
              return this.createError({
                path: `${this.path}[${index}].placeholder`,
                message: "Use a unique question for each custom input",
              });
            }
            seen.add(question);
          }

          return true;
        }
      ),

    text: yup.string().required("Add some content to the event"),
    ticketImg: yup
      .mixed()
      .required("A ticket image is required")
      .test(
        "fileType",
        "Please choose a JPG or PNG image",
        (value) =>
          typeof value === "string" ||
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type)
      )
      .test(
        "aspectRatio",
        "Ticket image must use the 300:97 aspect ratio",
        async (value) => {
          if (
            !value ||
            typeof value === "string" ||
            !["image/jpg", "image/jpeg", "image/png"].includes(value.type)
          ) {
            return true;
          }

          try {
            return await isImageCorrectRatio(value, 0.02);
          } catch {
            return false;
          }
        }
      ),
    poster: yup
      .mixed()
      .required("A poster is required")
      .test(
        "fileType",
        "Please choose a JPG or PNG image",
        (value) =>
          typeof value === "string" ||
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type)
      ),
    bgImageExtra: yup
      .mixed()
      .test(
        "fileType",
        "Please choose a JPG or PNG image",
        (value) =>
          !value ||
          typeof value === "string" ||
          ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
      ),
    extraImagesValidation: yup.string().test(
      "fileValidation",
      "Extra images are invalid",
      function (value) {
        return value ? this.createError({ message: value }) : true;
      }
    ),
  });

  const buildFormData = (values, saveAsDraft) => {
    const formData = new FormData();
    const orderedImages = extraImagesTouched
      ? extraImagesData.all ?? []
      : (initialData?.images ?? []).map((url) => ({
          isExisting: true,
          url,
        }));

    const imagesOrder = [];
    let newFileCounter = 0;

    orderedImages.forEach((img) => {
      if (img.isExisting) {
        imagesOrder.push({ type: "existing", url: img.url });
      } else {
        imagesOrder.push({
          type: "new",
          fileName: `image_${newFileCounter}`,
        });
        newFileCounter += 1;
      }
    });

    formData.append("imagesOrder", JSON.stringify(imagesOrder));
    formData.append(
      "existingImages",
      JSON.stringify(
        orderedImages.filter((img) => img.isExisting).map((img) => img.url)
      )
    );

    let fileIndex = 0;
    orderedImages.forEach((img) => {
      if (!img.isExisting && img.file) {
        formData.append("images", img.file, `image_${fileIndex}`);
        fileIndex += 1;
      }
    });

    Object.entries(values).forEach(([key, val]) => {
      if (key === "promoCodes") {
        if (val.isEnabled && val.codes?.length > 0) {
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
        val.forEach((value) => formData.append(`${key}[]`, value));
      } else if (val === null) {
        formData.append(key, "null");
      } else if (val !== undefined) {
        formData.append(key, val);
      }
    });

    formData.append("status", saveAsDraft ? EVENT_DRAFT : "opened");
    if (saveAsDraft) {
      formData.append("draftData", JSON.stringify(values));
    }

    return formData;
  };

  const submitValues = async (values, saveAsDraft = false) => {
    try {
      if (!saveAsDraft) await waitForConfirmation();

      setSubmitting(true);
      forceStartLoading();

      const responseData = props.edit
        ? await sendRequest(
            `future-event/edit-event/${eventId}`,
            "PATCH",
            buildFormData(values, saveAsDraft)
          )
        : await sendRequest(
            "future-event/add-event",
            "POST",
            buildFormData(values, saveAsDraft)
          );

      if (responseData.status) {
        navigate("/user/dashboard");
        dispatch(
          showNotification(
            saveAsDraft
              ? EVENT_DRAFT_SAVED
              : props.edit && initialData?.status !== EVENT_DRAFT
                ? EVENT_EDITED
                : EVENT_ADDED
          )
        );
        dispatch(
          props.edit
            ? editEventFromAll(responseData.event)
            : addEventToAll(responseData.event)
        );
      }
    } catch (err) {
      // Request errors are surfaced by useHttpClient.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ConfirmCenterModal
        text="Are you sure you want to submit the event?"
        onConfirm={onSubmit}
        visible={visible}
        setVisible={setVisible}
      />
      <LongLoading visible={submitting} />
      <ValidatedFormik
        className="container"
        validationSchema={schema}
        onSubmit={(values) => submitValues(values)}
        initialValues={{
          memberOnly: initialData?.memberOnly ?? false,
          hidden: initialData?.hidden ?? false,
          extraInputsForm: initialData?.extraInputsForm ?? [],
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
          extraImagesValidation: "",
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
            isEnabled:
              initialData?.status === EVENT_DRAFT
                ? initialData?.promoCodes?.isEnabled ?? false
                : initialData?.product?.promoCodes?.length > 0,
            codes:
              initialData?.status === EVENT_DRAFT
                ? initialData?.promoCodes?.codes ?? [
                    {
                      code: "",
                      discountType: 2,
                      discount: undefined,
                      useLimit: undefined,
                      timeLimit: "",
                      minAmount: undefined,
                      active: true,
                    },
                  ]
                : initialData?.product?.promoCodes?.length > 0
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
        {({ values, setFieldValue }) => (
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
                <h2 style={{ margin: 0, color: "#dc3545" }}>
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
                        marginBottom: "5px",
                      }}
                    >
                      Region <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Field
                      disabled={props.edit && initialData?.status !== EVENT_DRAFT}
                      as="select"
                      name="region"
                    >
                      <option value="" disabled>
                        Select Region
                      </option>
                      {regionOptions.map((val, index) => {
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
                        marginBottom: "5px",
                      }}
                    >
                      Date and Time <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <div data-field-name="date">
                      <CalendarWithClock
                        name="date"
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
                    </div>
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
                    <div data-field-name="poster">
                      <ImageInput
                        name="poster"
                        initialImage={values.poster}
                        onChange={(event) => {
                          setFieldValue("poster", event.target.files[0]);
                        }}
                      />
                    </div>
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
                    <div data-field-name="ticketImg">
                      <ImageInput
                        name="ticketImg"
                        initialImage={values.ticketImg}
                        onChange={(event) => {
                          setFieldValue("ticketImg", event.target.files[0]);
                        }}
                      />
                    </div>
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
                        name="bgImage"
                        placeholder="Choose default background"
                        initialValue={values.bgImage}
                        onSelect={(option) => setFieldValue("bgImage", option)}
                        options={bgs}
                      />
                      <ErrorMessage
                        className="error center_text"
                        name="bgImage"
                        component="div"
                        data-validation-message-for="bgImage"
                      />
                      <h5>or choose your own</h5>
                      <div data-field-name="bgImageExtra">
                        <ImageInput
                          name="bgImageExtra"
                          initialImage={values.bgImageExtra}
                          style={{ height: "150px" }}
                          onChange={(event) => {
                            setFieldValue("bgImageExtra", event.target.files[0]);
                            setFieldValue("bgImageSelection", 2);
                          }}
                        />
                        <ErrorMessage
                          className="error center_text"
                          name="bgImageExtra"
                          component="div"
                        />
                      </div>
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
                        <div data-field-name="ticketTimer">
                          <CalendarWithClock
                            name="ticketTimer"
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
                <h2 style={{ margin: 0, color: "#17a2b8" }}>
                  Optional Settings
                </h2>
                <small style={{ color: "#6c757d", fontStyle: "italic" }}>
                  Customize your event with these additional options
                </small>
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
              <div className="row center_text" style={{ width: "100%", margin: 0 }}>
                <div className="col-12 mt--20" style={{ width: "100%", padding: "0 15px", boxSizing: "border-box" }}>
                  <MultiImageUpload
                    existingImages={initialData?.images ?? []}
                    onImagesChange={handleExtraImagesChange}
                    name="extraImagesValidation"
                    onValidationChange={(message) =>
                      setFieldValue("extraImagesValidation", message)
                    }
                    label="Extra Description Images"
                    tooltip="Additional images to display at the bottom of the event page (poster is already included)"
                    maxImages={5}
                  />
                  <ErrorMessage
                    className="error center_text"
                    name="extraImagesValidation"
                    component="div"
                  />
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
                name="subEvent"
                onChange={(input) => setFieldValue("subEvent", input)}
                initialValues={values.subEvent}
              />

              <h3 className="label mt--40">Add extra inputs by your choice</h3>
              <InputsBuilder
                name="extraInputsForm"
                onChange={(inputs) => setFieldValue("extraInputsForm", inputs)}
                initialValues={values.extraInputsForm}
              />
            </div>
            {/* End of Optional Sections */}

            <ConfirmDialog />
            <div className="mt--40 mb--20 center_div">
              <button
                onClick={() => navigate("/user/dashboard")}
                type="button"
                className="rn-button-style--2 rn-btn-reverse mr--5"
              >
                Dashboard
              </button>
              {(!props.edit || initialData?.status === EVENT_DRAFT) && (
                <button
                  disabled={loading || submitting}
                  type="button"
                  onClick={() => submitValues(values, true)}
                  className="rn-button-style--2 rn-btn-reverse mr--5"
                >
                  <span>Save as Draft</span>
                </button>
              )}
              <button
                disabled={loading || submitting}
                type="submit"
                className="rn-button-style--2 rn-btn-reverse-green"
              >
                {loading ? (
                  <Loader />
                ) : (
                  <span>
                    {props.edit && initialData?.status !== EVENT_DRAFT
                      ? "Edit Event"
                      : "Submit Event"}
                  </span>
                )}
              </button>
            </div>
          </Form>
        )}
      </ValidatedFormik>
    </>
  );
};

EventForm.propTypes = {
  edit: PropTypes.bool,
  initialData: PropTypes.object,
};

export default EventForm;
