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
import BasicInfo from "./BasicInfo";
import PriceDetails from "./PriceDetails";
import ImagesSection from "./ImagesSection";
import AdditionalSettings from "./AdditionalSettings";
import ExtraInputsSection from "./ExtraInputsSection";

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
    description: yup.string().required("Description is required"),
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
              ),
          otherwise: () => yup.number().nullable(),
        }),
        memberPrice: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required(
                "Early Bird Member Price is required when Early Bird is enabled"
              ),
          otherwise: () => yup.number().nullable(),
        }),
        ticketLimit: yup.number().nullable(),
        ticketTimer: yup.string().nullable(),
      })
      .test(
        "at-least-one-limit",
        "Either Ticket Limit or Ticket Timer must be provided when Early Bird is enabled",
        function (values) {
          return (
            !values.isEnabled ||
            values.ticketLimit != null ||
            values.ticketTimer != "" ||
            values.startTimer != ""
          );
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
              .required(
                "Late Bird Price is required when Late Bird is enabled"
              ),
          otherwise: () => yup.number().nullable(),
        }),
        memberPrice: yup.number().when("isEnabled", {
          is: true,
          then: () =>
            yup
              .number()
              .required(
                "Late Bird Member Price is required when Late Bird is enabled"
              ),
          otherwise: () => yup.number().nullable(),
        }),
        ticketLimit: yup.number().nullable(),
        ticketTimer: yup.string().nullable(),
      })
      .test(
        "at-least-one-limit",
        "Either Ticket Limit or Ticket Timer must be provided when Late Bird is enabled",
        function (values) {
          return (
            !values.isEnabled ||
            values.ticketLimit != null ||
            values.ticketTimer != "" ||
            values.startTimer != ""
          );
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
      startTimer: yup.number().when("isEnabled", {
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
      startTimer: yup.number().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .number()
            .required("Please enter a start point of the guest promotion"),
        otherwise: () => yup.number().nullable(),
      }),
      endTimer: yup.string().when("isEnabled", {
        is: true,
        then: () =>
          yup
            .number()
            .required("Please enter an end point of the guest promotion"),
        otherwise: () => yup.number().nullable(),
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
              if (isPlainObject(val) || key === "extraInputsForm") {
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
          guestPrice: !isNaN(initialData?.product?.guest?.price)
            ? initialData.product?.guest?.price
            : undefined,
          memberPrice: !isNaN(initialData?.product?.member?.price)
            ? initialData.product?.member?.price
            : undefined,
          activeMemberPrice: !isNaN(initialData?.product?.activeMember?.price)
            ? initialData.product?.activeMember?.price
            : undefined,
          entryIncluding: initialData?.entryIncluding ?? "",
          memberIncluding: initialData?.memberIncluding ?? "",
          ticketLink: initialData?.ticketLink ?? "",
          text: initialData?.text ?? "",
          images: initialData?.images ?? [],
          ticketImg: initialData?.ticketImg ?? null,
          ticketColor: initialData?.ticketColor ?? "#faf9f6",
          ticketQR: `${initialData?.ticketQR ?? true}`,
          ticketName: `${initialData?.ticketName ?? true}`,
          poster: initialData?.poster ?? null,
          bgImage: initialData?.bgImage ?? 1,
          bgImageExtra: initialData?.bgImageExtra ?? null,
          bgImageSelection: initialData?.bgImageSelection ?? 1,
          earlyBird: initialData?.earlyBird ?? {
            ticketLimit: undefined,
            startTimer: "",
            ticketTimer: "",
            price: undefined,
            memberPrice: undefined,
            isEnabled: false,
            excludeMembers: false,
          },
          lateBird: initialData?.lateBird ?? {
            ticketLimit: undefined,
            startTimer: "",
            ticketTimer: "",
            price: undefined,
            memberPrice: undefined,
            isEnabled: false,
            excludeMembers: false,
          },
          guestPromotion: {
            ...(initialData?.promotion?.guest ?? {
              isEnabled: false,
              startTimer: "",
              endTimer: "",
              discount: undefined,
            }),
          },
          memberPromotion: {
            ...(initialData?.promotion?.member ?? {
              isEnabled: false,
              startTimer: "",
              endTimer: "",
              discount: undefined,
            }),
          },
        }}
      >
        {({ values, setFieldValue, errors, isValid, dirty }) => (
          <Form
            encType="multipart/form-data"
            id="form"
            style={{ padding: "2%" }}
          >
            <BasicInfo 
              values={values}
              setFieldValue={setFieldValue}
              edit={props.edit}
            /><br />
            <PriceDetails
              values={values}
              setFieldValue={setFieldValue}
            /><br />

            <ImagesSection
              values={values}
              setFieldValue={setFieldValue}
              dispatch={dispatch} // Pass redux dispatch
              showNotification={(notification) =>
                dispatch(showNotification(notification))
              }
            />
            {/* <h3 className="mt--30 label">Images</h3>
            <div className="row">
              <div className="col-lg-6 col-md-6 col-12 mt--20">
                <hr />
                <h5 className="center_text">Poster Image</h5>
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
              <div className="col-lg-6 col-md-6 col-12 mt--20">
                <hr />
                <h5 className="center_text">Ticket Image</h5>
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
                  *ticket must be jpg or png in resolution 300:97 (like 1500 x
                  485)
                </p>
                <ErrorMessage
                  className="error center_div"
                  name="ticketImg"
                  component="div"
                />
                <div className="row">
                  <div
                    className="col-lg-6 col-md-6 col-6"
                    style={{ margin: "auto" }}
                  >
                    <h5 className="center_text">Name on ticket color</h5>
                    <div className="center_div" style={{ gap: "50px" }}>
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
                    className="col-lg-6 col-md-6 col-6"
                    style={{ margin: "auto" }}
                  >
                    <h5 className="center_text">With Guest Name</h5>
                    <div className="center_div" style={{ gap: "50px" }}>
                      <p className="center_div">
                        <Field type="radio" name="ticketName" value={"true"} />
                        Yes
                      </p>
                      <p className="center_div">
                        <Field type="radio" name="ticketName" value={"false"} />
                        No
                      </p>
                    </div>
                  </div>
                  <div
                    className="col-lg-6 col-md-6 col-6"
                    style={{ margin: "auto" }}
                  >
                    <h5 className="center_text">With QR</h5>
                    <div className="center_div" style={{ gap: "50px" }}>
                      <p className="center_div">
                        <Field type="radio" name="ticketQR" value={"true"} />
                        Yes
                      </p>
                      <p className="center_div">
                        <Field type="radio" name="ticketQR" value={"false"} />
                        No
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row center_text">
              <div className="col-lg-6 col-12 mt--20">
                <hr />
                <h5 className="mt--30">
                  Extra Description Images (Pictures to see at the bottom of the
                  page - poster is automatically assigned)
                </h5>
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
              <div className="col-lg-6 col-12 mt--20">
                <hr />
                <h5 className="mt--30">Background Image (hover for preview)</h5>
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
            </div> */}

            <AdditionalSettings
              values={values}
              setFieldValue={setFieldValue}
            /><br />
            <ExtraInputsSection
              values={values}
              setFieldValue={setFieldValue}
            /><br />

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
