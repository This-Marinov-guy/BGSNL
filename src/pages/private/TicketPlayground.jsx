import React, { useState } from "react";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .min(1, "Minimum quantity is 1")
    .max(20, "Maximum quantity is 20")
    .required("Quantity is required"),
});

const TicketPlayground = () => {
  const { loading, sendRequest } = useHttpClient();
  const [preview, setPreview] = useState(null);

  return (
    <>
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="blog-comment-form pb--120 bg_color--1 pt--120">
        <div className="container">
          <h2 className="center_text mb--20">Ticket Playground</h2>
          <p className="center_text mb--40">
            Generates a ticket preview with latest event template, QR code and
            name labels.
          </p>

          <Formik
            validationSchema={schema}
            initialValues={{ name: "Test", surname: "User", quantity: 1 }}
            onSubmit={async (values) => {
              const response = await sendRequest(
                "payment/playground/ticket",
                "POST",
                {
                  name: values.name,
                  surname: values.surname,
                  quantity: Number(values.quantity),
                  origin_url: window.location.origin,
                }
              );

              if (response?.status && response?.ticketUrl) {
                setPreview(response);
              }
            }}
          >
            {() => (
              <Form className="row">
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="rn-form-group">
                    <Field type="text" name="name" placeholder="Name" />
                    <ErrorMessage className="error" name="name" component="div" />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="rn-form-group">
                    <Field type="text" name="surname" placeholder="Surname" />
                    <ErrorMessage
                      className="error"
                      name="surname"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="rn-form-group">
                    <Field type="number" name="quantity" placeholder="Quantity" />
                    <ErrorMessage
                      className="error"
                      name="quantity"
                      component="div"
                    />
                  </div>
                </div>

                <div className="col-12 center_div mt--20">
                  <button
                    type="submit"
                    className="rn-button-style--2 rn-btn-reverse-green"
                    disabled={loading}
                  >
                    {loading ? <Loader /> : "Generate Preview"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {preview?.ticketUrl && (
            <div className="mt--50">
              <h4 className="mb--20 center_text">
                Latest Event: {preview?.event?.title}
              </h4>
              <p className="center_text mb--20">
                Preview for {preview?.preview?.name} {preview?.preview?.surname}
                {" | "}x{preview?.preview?.quantity}
              </p>
              <div className="center_div">
                <img
                  src={preview.ticketUrl}
                  alt="Generated playground ticket"
                  style={{ width: "100%", maxWidth: "1200px", borderRadius: "12px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ScrollToTop showUnder={160}>
        <button className="scroll-top">
          <FiChevronUp />
        </button>
      </ScrollToTop>
    </>
  );
};

export default TicketPlayground;
