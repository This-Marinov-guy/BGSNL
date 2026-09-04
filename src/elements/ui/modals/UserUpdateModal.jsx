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
import { Dropdown } from "@/compat/primereact";
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
    .max(320, "Email is too long")
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

const alumniSchema = schema.omit(["phone"]);

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
      show={modal.includes(USER_UPDATE_MODAL)}
      title="Update your details"
      onHide={closeHandler}
    >
      <ValidatedFormik
        className="inner"
        validationSchema={isAlumni ? alumniSchema : schema}
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

            let responseData;
            let checkEmail = false;

            if (currentUser.email !== values.email) {
              checkEmail = true;

              responseData = await sendRequest("security/check-email", "POST", {
                email: values.email,
              });
            }

            if (!checkEmail || responseData?.status === true) {
              const responseEditUser = await sendRequest(
                `user/edit-info`,
                "PATCH",
                formData
              );

              if (responseEditUser?.status === true) {
                // Refresh user data in the background
                if (onUserRefresh) {
                  refreshUser(onUserRefresh);
                }
                closeHandler();
              }
            }
          } catch (err) {
            console.log(err);
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
            encType="multipart/form-data"
            id="form"
            style={{ padding: "2%" }}
          >
            <div className="row mb--40 mt--40">
              <div
                className="col-lg-12 col-md-12 col-12 d-flex flex-column"
                style={{ gap: "10px" }}
              >
                <ImageInput
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
                <p className="information">Click on the image to change it</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <Field type="text" placeholder="Name" name="name" />
                  <ErrorMessage className="error" name="name" component="div" />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <Field
                    type="text"
                    placeholder="Surname"
                    name="surname"
                  ></Field>
                  <ErrorMessage
                    className="error"
                    name="surname"
                    component="div"
                  />
                </div>
              </div>

              {!isAlumni && (
                <div className="col-12">
                  <div className="signup-agreements signup-working-checkbox">
                    <div data-field-name="isWorking">
                      <label className="hor_section_nospace">
                        <Field
                          style={{ maxWidth: "30px" }}
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
                        <p className="information">
                          I&apos;m currently working. Use my profession instead
                          of study details.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {!isAlumni && (
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group" data-field-name="phone">
                    <PhoneInput
                      name="phone"
                      placeholder="WhatsApp Phone "
                      initialValue={values.phone}
                      onChange={(value) => setFieldValue("phone", value)}
                    ></PhoneInput>
                    <p className="information">
                      Please type your number with + and country code
                    </p>
                    <ErrorMessage
                      className="error"
                      name="phone"
                      component="div"
                    />
                  </div>
                </div>
              )}

              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <Field type="email" placeholder="Email" name="email" />
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
                            <div data-field-name="university">
                              <Dropdown
                                value={values.university}
                                filter
                                onChange={(e) => {
                                  setFieldValue("university", e.value);
                                }}
                                options={uniOptions}
                                name="university"
                                className="p-dropdown-custom"
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
                                <Field
                                  type="text"
                                  placeholder="State the university"
                                  name="otherUniversityName"
                                ></Field>
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
                              <Field
                                type="number"
                                min="1900"
                                max="2200"
                                placeholder="Graduation Year"
                                name="graduationDate"
                              ></Field>
                              <ErrorMessage
                                className="error"
                                name="graduationDate"
                                component="div"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                              <Field
                                type="text"
                                placeholder="Study Program"
                                name="course"
                              ></Field>
                              <ErrorMessage
                                className="error"
                                name="course"
                                component="div"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                              <Field
                                type="text"
                                placeholder="Student Number"
                                name="studentNumber"
                              ></Field>
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
                            <Field
                              type="text"
                              placeholder="Profession"
                              name="profession"
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
                  <Field
                    type="password"
                    placeholder="Change Password"
                    name="password"
                  ></Field>
                  <ErrorMessage
                    className="error"
                    name="password"
                    component="div"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-12">
                <div className="rn-form-group">
                  <Field
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                  ></Field>
                  <ErrorMessage
                    className="error"
                    name="confirmPassword"
                    component="div"
                  />
                </div>
              </div>
            </div>
            <div className="mt--40 options-btns-div center_div">
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
