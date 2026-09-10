import { Fragment } from "react";
import PropTypes from "prop-types";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import * as yup from "yup";
import {
  Dropdown,
  Password,
} from "@/compat/primereact";
import Loader from "../../../elements/ui/loading/Loader";
import StepContentTransition from "../../../elements/ui/functional/StepContentTransition";
import { useRefreshUser } from "../../../hooks/common/api-hooks";
import { useHttpClient } from "../../../hooks/common/http-hook";
import {
  removeModal,
  selectModal,
} from "../../../redux/modal";
import {
  ALUMNI,
  USER_UPDATE_MODAL,
} from "../../../util/defines/common";
import {
  reorderUniversitiesByCode,
  UNIVERSITIES_BY_CITY,
} from "../../../util/defines/UNIVERSITIES";
import ImageInput from "../../inputs/common/ImageInput";
import PhoneInput from "../../inputs/common/PhoneInput";
import ValidatedFormik from "../forms/ValidatedFormik";
import ModalWindow from "./ModalWindow";
import { showNotification } from "../../../redux/notification";

const emptyStringToNull = (value, originalValue) =>
  originalValue === "" ? null : value;

const isSupportedImage = (value) =>
  !value ||
  typeof value === "string" ||
  ["image/jpg", "image/jpeg", "image/png"].includes(value.type);

const schema = yup.object().shape({
  image: yup
    .mixed()
    .test("fileType", "Please choose a JPG or PNG image", isSupportedImage),
  name: yup
    .string()
    .trim()
    .max(120, "Name is too long")
    .required("Name is required"),
  surname: yup
    .string()
    .trim()
    .max(120, "Surname is too long")
    .required("Surname is required"),
  phone: yup
    .string()
    .transform(emptyStringToNull)
    .nullable()
    .min(8, "Please provide a valid phone number")
    .max(40, "Please provide a valid phone number"),
  email: yup
    .string()
    .trim()
    .max(254, "Email is too long")
    .email("Please enter a valid email")
    .required("Email is required"),
  university: yup.string(),
  isWorking: yup.boolean(),
  otherUniversityName: yup.string(),
  graduationDate: yup
    .number()
    .transform(emptyStringToNull)
    .nullable()
    .integer("Graduation year is invalid")
    .min(1900, "Graduation year is invalid")
    .max(2200, "Graduation year is invalid"),
  course: yup.string(),
  studentNumber: yup.string(),
  profession: yup
    .string()
    .trim()
    .max(200, "Profession is too long")
    .when("isWorking", {
      is: true,
      then: (fieldSchema) =>
        fieldSchema.required("Your profession is required"),
      otherwise: (fieldSchema) => fieldSchema,
    }),
  password: yup
    .string()
    .transform(emptyStringToNull)
    .nullable()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
      "Please create a stronger password with capital and small letters, number and a special symbol"
    ),
  confirmPassword: yup
    .string()
    .transform(emptyStringToNull)
    .nullable()
    .oneOf([yup.ref("password"), null], "Passwords do not match"),
});

const groupedItemTemplate = (option) => {
  const isNoMatch = option.label === "No matching universities";

  return (
    <div
      className={`flex align-items-start justify-content-start${
        isNoMatch ? " university-select-no-match" : ""
      }`}
    >
      <div>{option.label}</div>
    </div>
  );
};

const OTHER_UNIVERSITY_OPTION = {
  label: "Enter another university",
  value: "other",
};

const UserUpdateModal = ({ currentUser, onUserRefresh }) => {
  const { loading, sendRequest } = useHttpClient();
  const { refreshUser } = useRefreshUser();

  const modal = useSelector(selectModal);

  const dispatch = useDispatch();

  const closeHandler = () => {
    dispatch(removeModal(USER_UPDATE_MODAL));
  };

  const uniOptions = reorderUniversitiesByCode(
    UNIVERSITIES_BY_CITY,
    currentUser?.region
  );

  const isAlumni = currentUser.roles.includes(ALUMNI);

  return (
    <ModalWindow
      className="user-update-modal"
      contentClassName="user-update-modal__body"
      show={modal.includes(USER_UPDATE_MODAL)}
      title="Update your details"
      onHide={closeHandler}
    >
      <p>Email and password changes require confirmation sent to your current email. A new email address must also be verified.</p>
      <ValidatedFormik
        className="inner"
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            const isWorking =
              values.isWorking || values.university === "working";
            const formData = new FormData();
            if (values.image) {
              formData.append(
                "image",
                values.image,
                currentUser.name + currentUser.surname + currentUser.birth
              );
            } else {
              formData.append("image", null);
            }
            formData.append("region", currentUser.region);
            formData.append("name", values.name);
            formData.append("surname", values.surname);
            formData.append("phone", values.phone);
            formData.append("email", values.email);
            formData.append(
              "university",
              isWorking ? "working" : values.university
            );
            if (values.password) {
              formData.append("password", values.password);
              formData.append("confirmPassword", values.confirmPassword);
            }
            formData.append(
              "otherUniversityName",
              !isWorking && values.university === "other"
                ? values.otherUniversityName
                : ""
            );
            formData.append(
              "graduationDate",
              isWorking ? "" : values.graduationDate
            );
            formData.append("course", isWorking ? "" : values.course);
            formData.append(
              "studentNumber",
              isWorking ? "" : values.studentNumber
            );
            formData.append(
              "profession",
              isWorking ? values.profession.trim() : ""
            );
            formData.append(
              "notificationTypeTerms",
              values.notificationTypeTerms
            );

            const responseEditUser = await sendRequest("user/edit-info", "PATCH", formData);
            if (responseEditUser?.status === true) {
              if (onUserRefresh) refreshUser(onUserRefresh);
              closeHandler();
              dispatch(showNotification({ severity: responseEditUser.confirmationRequired ? "info" : "success",
                detail: responseEditUser.message || "Your profile has been updated." }));
            }
          } catch {
            dispatch(showNotification({ severity: "error", detail: "Could not submit your profile changes. Please try again." }));
          }
        }}
        initialValues={{
          image: "",
          name: currentUser.name ?? "",
          surname: currentUser.surname ?? "",
          phone: currentUser.phone ?? "",
          email: currentUser.email ?? "",
          university: currentUser.university ?? "",
          isWorking: currentUser.university === "working",
          otherUniversityName: currentUser.otherUniversityName ?? "",
          graduationDate: currentUser.graduationDate ?? "",
          course: currentUser.course ?? "",
          studentNumber: currentUser.studentNumber ?? "",
          profession: currentUser.profession ?? "",
          password: "",
          confirmPassword: "",
        }}
      >
        {({ values, setFieldValue }) => (
          <Form
            className="user-update-form"
            encType="multipart/form-data"
            id="user-update-form"
          >
            <div className="user-update-form__photo">
              <div className="user-update-form__photo-control">
                <ImageInput
                  className="user-update-form__image"
                  name="image"
                  onChange={(event) => {
                    setFieldValue("image", event.target.files[0]);
                  }}
                  initialImage={currentUser.image}
                  errorRequired={
                    <ErrorMessage
                      className="error"
                      name="image"
                      component="div"
                    />
                  }
                />
                <p className="information user-update-form__photo-help">
                  Select your photo to replace it
                </p>
              </div>
            </div>
            <div className="row user-update-form__fields">
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <label htmlFor="user-update-name">
                    Name <span className="required-mark">*</span>
                  </label>
                  <Field
                    className="bgsnl-form-control"
                    id="user-update-name"
                    name="name"
                    placeholder="e.g., John"
                    type="text"
                  />
                  <ErrorMessage className="error" name="name" component="div" />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <label htmlFor="user-update-surname">
                    Surname <span className="required-mark">*</span>
                  </label>
                  <Field
                    className="bgsnl-form-control"
                    id="user-update-surname"
                    name="surname"
                    placeholder="e.g., Doe"
                    type="text"
                  />
                  <ErrorMessage
                    className="error"
                    name="surname"
                    component="div"
                  />
                </div>
              </div>

              {!isAlumni && (
                <div className="col-12">
                  <div
                    className="user-update-form__work-status"
                    data-field-name="isWorking"
                  >
                    <label>
                      <Field
                        className="user-update-form__checkbox"
                        type="checkbox"
                        name="isWorking"
                        checked={values.isWorking}
                        onChange={(event) => {
                          const isWorking = event.target.checked;
                          setFieldValue("isWorking", isWorking);
                          setFieldValue(
                            "university",
                            isWorking ? "working" : ""
                          );
                          setFieldValue("otherUniversityName", "");
                          setFieldValue("graduationDate", "");
                          setFieldValue("course", "");
                          setFieldValue("studentNumber", "");
                          setFieldValue("profession", "");
                        }}
                      />
                      <span>
                        I&apos;m currently working. Use my profession instead of
                        study details.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group" data-field-name="phone">
                  <label>WhatsApp phone</label>
                  <PhoneInput
                    name="phone"
                    placeholder="Phone number"
                    initialValue={values.phone}
                    onChange={(value) => setFieldValue("phone", value)}
                  />
                  <p className="information">
                    Include your country code
                  </p>
                  <ErrorMessage
                    className="error"
                    name="phone"
                    component="div"
                  />
                </div>
              </div>

              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <label htmlFor="user-update-email">
                    Email <span className="required-mark">*</span>
                  </label>
                  <Field
                    className="bgsnl-form-control"
                    id="user-update-email"
                    name="email"
                    placeholder="e.g., john.doe@email.com"
                    type="email"
                  />
                  <ErrorMessage
                    className="error"
                    name="email"
                    component="div"
                  />
                </div>
              </div>

              {!isAlumni && (
                <div className="col-12 signup-field-mode-transition">
                  <StepContentTransition
                    direction={values.isWorking ? "forward" : "backward"}
                    step={values.isWorking ? 1 : 0}
                  >
                    <div className="row">
                      {!values.isWorking && (
                        <>
                          <div className="col-lg-6 col-md-12 col-12">
                            <div
                              className="rn-form-group"
                              data-field-name="university"
                            >
                              <label>University</label>
                              <Dropdown
                                ariaLabel="University"
                                value={values.university}
                                filter
                                onChange={(e) => {
                                  setFieldValue("university", e.value);
                                }}
                                options={uniOptions}
                                name="university"
                                className="p-dropdown-custom bgsnl-form-control"
                                placeholder="Select your university"
                                filterPlaceholder="Search universities"
                                appendTo={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : undefined
                                }
                                panelClassName="university-select-panel"
                                filterFallbackOption={OTHER_UNIVERSITY_OPTION}
                                filterFallbackGroupLabel="No matching universities"
                                optionLabel="label"
                                optionValue="value"
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                optionGroupTemplate={groupedItemTemplate}
                              />
                            </div>
                            <ErrorMessage
                              className="error"
                              name="university"
                              component="div"
                            />
                          </div>
                          {values.university === "other" && (
                            <div className="col-lg-6 col-md-12 col-12">
                              <div className="rn-form-group">
                                <label htmlFor="user-update-other-university">
                                  University name
                                </label>
                                <Field
                                  className="bgsnl-form-control"
                                  id="user-update-other-university"
                                  name="otherUniversityName"
                                  placeholder="State the university"
                                  type="text"
                                />
                                <ErrorMessage
                                  className="error"
                                  name="otherUniversityName"
                                  component="div"
                                />
                              </div>
                            </div>
                          )}
                          <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                              <label htmlFor="user-update-graduation">
                                Graduation Year
                              </label>
                              <Field
                                className="bgsnl-form-control"
                                id="user-update-graduation"
                                max="2200"
                                min="1900"
                                name="graduationDate"
                                placeholder="e.g., 2026"
                                type="number"
                              />
                              <ErrorMessage
                                className="error"
                                name="graduationDate"
                                component="div"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                              <label htmlFor="user-update-course">
                                Study Program
                              </label>
                              <Field
                                className="bgsnl-form-control"
                                id="user-update-course"
                                name="course"
                                placeholder="e.g., Computer Science"
                                type="text"
                              />
                              <ErrorMessage
                                className="error"
                                name="course"
                                component="div"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                              <label htmlFor="user-update-student-number">
                                Student Number
                              </label>
                              <Field
                                className="bgsnl-form-control"
                                id="user-update-student-number"
                                name="studentNumber"
                                placeholder="e.g., s1234567"
                                type="text"
                              />
                              <ErrorMessage
                                className="error"
                                name="studentNumber"
                                component="div"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {values.isWorking && (
                        <div className="col-lg-6 col-md-12 col-12">
                          <div className="rn-form-group">
                            <label htmlFor="user-update-profession">
                              Profession
                            </label>
                            <Field
                              className="bgsnl-form-control"
                              id="user-update-profession"
                              name="profession"
                              placeholder="e.g., Software Engineer"
                              type="text"
                            />
                            <ErrorMessage
                              className="error"
                              name="profession"
                              component="div"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </StepContentTransition>
                </div>
              )}
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <label htmlFor="user-update-password">Change Password</label>
                  <Password
                    autoComplete="new-password"
                    feedback={false}
                    id="user-update-password"
                    inputClassName="bgsnl-form-control"
                    name="password"
                    onChange={(event) =>
                      setFieldValue("password", event.target.value)
                    }
                    placeholder="Leave blank to keep current"
                    toggleMask
                    unstyled
                    value={values.password}
                  />
                  <ErrorMessage
                    className="error"
                    name="password"
                    component="div"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <label htmlFor="user-update-confirm-password">
                    Confirm Password
                  </label>
                  <Password
                    autoComplete="new-password"
                    feedback={false}
                    id="user-update-confirm-password"
                    inputClassName="bgsnl-form-control"
                    name="confirmPassword"
                    onChange={(event) =>
                      setFieldValue("confirmPassword", event.target.value)
                    }
                    placeholder="Repeat the new password"
                    toggleMask
                    unstyled
                    value={values.confirmPassword}
                  />
                  <ErrorMessage
                    className="error"
                    name="confirmPassword"
                    component="div"
                  />
                </div>
              </div>
            </div>
            <div className="user-update-form__actions">
              <button
                disabled={loading}
                type="button"
                onClick={closeHandler}
                className="rn-button-style--2 rn-btn-reverse"
              >
                {<span>Cancel</span>}
              </button>
              <button
                disabled={loading}
                type="submit"
                className="rn-button-style--2 rn-btn-reverse-green"
              >
                {loading ? <Loader /> : <span>Update information</span>}
              </button>
            </div>
          </Form>
        )}
      </ValidatedFormik>
    </ModalWindow>
  );
};

UserUpdateModal.propTypes = {
  currentUser: PropTypes.shape({
    birth: PropTypes.string,
    course: PropTypes.string,
    email: PropTypes.string,
    graduationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    name: PropTypes.string,
    otherUniversityName: PropTypes.string,
    profession: PropTypes.string,
    phone: PropTypes.string,
    region: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    studentNumber: PropTypes.string,
    surname: PropTypes.string,
    university: PropTypes.string,
  }).isRequired,
  onUserRefresh: PropTypes.func,
};

export default UserUpdateModal;
