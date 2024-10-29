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
import { USER_UPDATE_MODAL } from "../../../util/defines/common";
import PhoneInput from "../../inputs/common/PhoneInput";

const schema = yup.object().shape({
    image: yup.string(),
    name: yup.string(),
    surname: yup.string(),
    phone: yup.string().min(8),
    email: yup.string().email("Please enter a valid email"),
    university: yup.string(),
    otherUniversityName: yup.string().when("university", {
        is: "other",
        then: () => yup.string(),
        otherwise: () => yup.string(),
    }),
    graduationDate: yup.number(),
    course: yup.string().when("university", {
        is: true,
        then: () => yup.string(),
        otherwise: () => yup.string(),
    }),
    studentNumber: yup.string().when("university", {
        is: true,
        then: () =>
            yup.string(),
        otherwise: () => yup.string(),
    }),
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
        .oneOf([yup.ref("password"), null], "Passwords do not match")
});

const UserUpdateModal = ({ currentUser }) => {
    const { loading, sendRequest } = useHttpClient();

    const modal = useSelector(selectModal);

    const dispatch = useDispatch();

    const closeHandler = () => {
        dispatch(removeModal(USER_UPDATE_MODAL));
    };

    return (
      <ModalWindow show={modal.includes(USER_UPDATE_MODAL)}>
        <Formik
          className="inner"
          validationSchema={schema}
          onSubmit={async (values) => {
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
            if (currentUser.email !== values.email) {
              try {
                const responseData = await sendRequest(
                  "security/check-email",
                  "POST",
                  {
                    email: values.email,
                  }
                );

                if (responseData?.status === true) {
                  const responseEditUser = await sendRequest(
                    `user/edit-info`,
                    "PATCH",
                    formData
                  );

                  if (responseEditUser?.status === true) {
                    window.location.reload();
                  }
                }
              } catch (err) {
                return;
              }
            }
          }}
          initialValues={{
            image: "",
            name: currentUser.name,
            surname: currentUser.surname,
            phone: currentUser.phone,
            email: currentUser.email,
            university: currentUser.university,
            otherUniversityName: currentUser.otherUniversityName,
            graduationDate: currentUser.otherUniversityName || "",
            course: currentUser.course,
            studentNumber: currentUser.studentNumber,
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
                <div className="col-lg-12 col-md-12 col-12">
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
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <Field type="text" placeholder="Name" name="name" />
                    <ErrorMessage
                      className="error"
                      name="name"
                      component="div"
                    />
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

                <div className="col-lg-6 col-md-12 col-12">
                  <div className="rn-form-group">
                    <PhoneInput
                      placeholder="WhatsApp Phone "
                      onChange={value => setFieldValue("phone", value)}
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
                <div className="col-lg-6 col-md-12 col-12">
                  <Field as="select" name="university">
                    <option value="" disabled>
                      Select your university
                    </option>
                    <option value="RUG">RUG</option>
                    <option value="Hanze">Hanze</option>
                    <option value="other">Other university</option>
                    <option value="working">Working</option>
                  </Field>
                  <ErrorMessage
                    className="error"
                    name="university"
                    component="div"
                  />
                </div>

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
                {values.university !== "working" && (
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
}

export default UserUpdateModal