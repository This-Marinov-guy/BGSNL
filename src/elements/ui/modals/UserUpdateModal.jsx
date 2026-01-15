import React, { Fragment } from "react";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { useSelector, useDispatch } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { FiX } from "react-icons/fi";
import ModalWindow from "./ModalWindow";
import Loader from "../../../elements/ui/loading/Loader";
import ImageInput from "../../inputs/common/ImageInput";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ALUMNI, USER_UPDATE_MODAL } from "../../../util/defines/common";
import PhoneInput from "../../inputs/common/PhoneInput";
import {
  reorderUniversitiesByCode,
  UNIVERSITIES_BY_CITY,
} from "../../../util/defines/UNIVERSITIES";
import { Dropdown } from "primereact/dropdown";
import { useRefreshUser } from "../../../hooks/common/api-hooks";

const schema = yup.object().shape({
  name: yup.string(),
  surname: yup.string(),
  phone: yup.string().min(8),
  email: yup.string().email("Please enter a valid email"),
  university: yup.string(),
  otherUniversityName: yup.string(),
  graduationDate: yup.number(),
  course: yup.string(),
  studentNumber: yup.string(),
  password: yup
    .string()
    .nullable()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
      "Please create a stronger password with capital and small letters, number and a special symbol"
    ),
  confirmPassword: yup
    .string()
    .nullable()
    .oneOf([yup.ref("password"), null], "Passwords do not match"),
});

const groupedItemTemplate = (option) => {
  return (
    <div className="flex align-items-start justify-content-start">
      <div>{option.label}</div>
    </div>
  );
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
    <ModalWindow show={modal.includes(USER_UPDATE_MODAL)}>
      <Formik
        className="inner"
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
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
            formData.append("university", values.university);
            if (values.password) {
              formData.append("password", values.password);
              formData.append("confirmPassword", values.confirmPassword);
            }
            formData.append("otherUniversityName", values.otherUniversityName);
            formData.append("graduationDate", values.graduationDate);
            formData.append("course", values.course);
            formData.append("studentNumber", values.studentNumber);
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
          otherUniversityName: currentUser.otherUniversityName ?? "",
          graduationDate: currentUser.graduationDate ?? "",
          course: currentUser.course ?? "",
          studentNumber: currentUser.studentNumber ?? "",
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
            <div className="hor_section">
              <h3 style={{ margin: "auto" }}>Update your details</h3>
              <FiX className="x_icon" onClick={closeHandler} />
            </div>
            <div className="row mb--40 mt--40">
              <div
                className="col-lg-12 col-md-12 col-12 d-flex flex-column"
                style={{ gap: "10px" }}
              >
                <ImageInput
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
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <PhoneInput
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
                <div className="col-lg-6 col-md-12 col-12">
                  <Dropdown
                    value={values.university}
                    filter
                    onChange={(e) => {
                      setFieldValue("university", e.value);
                    }}
                    options={uniOptions}
                    name="university"
                    className="p-dropdown-custom"
                    placeholder="State your University"
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    optionGroupTemplate={groupedItemTemplate}
                  />
                  <ErrorMessage
                    className="error"
                    name="university"
                    component="div"
                  />
                </div>
              )}

              <div className="col-lg-6 col-md-12 col-12">
                {values.university === "other" && (
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
                )}
              </div>
              {values.university !== "working" && !isAlumni && (
                <Fragment>
                  <div className="col-lg-6 col-md-12 col-12">
                    <Field
                      type="number"
                      min="2020"
                      max="2050"
                      placeholder="Graduation Year"
                      name="graduationDate"
                    ></Field>
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
                  <div className="col-lg-6 col-md-12 col-12"></div>
                </Fragment>
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
      </Formik>
    </ModalWindow>
  );
};

export default UserUpdateModal;
