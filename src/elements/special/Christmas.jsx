import React, { useState, Fragment } from "react";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../ui/loading/Loader";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiX } from "react-icons/fi";

import ModalWindow from "../ui/modals/ModalWindow";

import GifSearch from "./GifSearch";
import GifImage from "./GifImage";
import { HOLIDAYS } from "../../util/configs/common";

const schema = yup.object().shape({
  text: yup.string().required("You are not sending without a wish >:("),
  sender: yup.string().when("hideSender", {
    is: false,
    then: () => yup.string().required("Please fill your name"),
    otherwise: () => yup.string(),
  }),
  receiver: yup.string().when("randomReceiver", {
    is: false,
    then: () =>
      yup.string().required("Please fill the full name of the receiver"),
    otherwise: () => yup.string(),
  }),
});

const Christmas = (props) => {
  const [showInbox, setShowInbox] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [gif, setGif] = useState(null);
  const [success, setSuccess] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  // Array of bow images
  const bowImages = [
    "/assets/images/special/bows/bow-1.png",
    "/assets/images/special/bows/bow-2.png",
    "/assets/images/special/bows/bow-3.png",
  ];

  // Function to get a random bow for a card (consistent per card index)
  const getRandomBow = (index) => {
    // Use index to ensure consistent bow per card, but vary across cards
    return bowImages[index % bowImages.length];
  };

  if (!HOLIDAYS.isChristmas) {
    return;
  }

  return (
    <Fragment>
      {showInbox && (
        <ModalWindow show={showInbox}>
          <div
            className="inner"
            style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                borderBottom: "2px solid #e9ecef",
                paddingBottom: "15px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#017363",
                  fontSize: "24px",
                  fontWeight: "600",
                }}
              >
                Your Christmas Cards
              </h3>
              <FiX
                className="x_icon"
                onClick={() => {
                  setShowInbox(false);
                }}
                style={{
                  cursor: "pointer",
                  fontSize: "24px",
                  color: "#6c757d",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#dc3545")}
                onMouseLeave={(e) => (e.target.style.color = "#6c757d")}
              />
            </div>
            {props.currentUser.christmas.length > 0 ? (
              <div className="row mt--20" style={{ gap: "20px" }}>
                {props.currentUser.christmas.map((card, index) => (
                  <div key={index} className="christmas-card-wrapper">
                    <div className="christmas-card">
                      {/* Bow */}
                      <img
                        src={getRandomBow(index)}
                        alt="bow decoration"
                        className="christmas-bow"
                      />

                      <div className="christmas-content-grid">
                        {/* GIF */}
                        <div className="christmas-gif">
                          <GifImage src={card.gif} />
                        </div>

                        {/* TEXT */}
                        <div className="christmas-text">
                          <div className="christmas-row">
                            <div>
                              <span className="label">From</span>
                              <p>{card.sender || "Anonymous"}</p>
                            </div>
                            <div>
                              <span className="label">To</span>
                              <p>{card.receiver}</p>
                            </div>
                          </div>

                          <div className="christmas-message">
                            <span className="label">Message</span>
                            <p>{card.text}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "2px dashed #dee2e6",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6c757d",
                    fontSize: "18px",
                    fontStyle: "italic",
                  }}
                >
                  No cards yet - you can always send one to yourself 😊
                </p>
              </div>
            )}
          </div>
        </ModalWindow>
      )}
      {showForm && (
        <ModalWindow show={showForm}>
          <Formik
            className="inner"
            validationSchema={schema}
            initialValues={{
              text: "",
              gif: "",
              sender: props.currentUser.name + " " + props.currentUser.surname,
              receiver: "",
              randomReceiver: false,
              hideSender: false,
            }}
            onSubmit={async (values) => {
              try {
                const responseData = await sendRequest(
                  "special/add-card",
                  "POST",
                  {
                    text: values.text,
                    gif: gif,
                    sender: values.sender,
                    receiver: values.receiver,
                    randomReceiver: values.randomReceiver,
                    hideSender: values.hideSender,
                  }
                );
                if (responseData.message == "Success") {
                  setSuccess(true);
                }
              } catch (error) {
                console.log(error);
              }
            }}
          >
            {success ? (
              <div style={{ padding: "10px" }}>
                <FiX
                  className="x_icon"
                  onClick={() => {
                    setShowForm(false);
                  }}
                />
                <img src="https://i.pinimg.com/originals/ff/6e/bd/ff6ebd0dfb50a44c04c842f365df4446.gif"></img>
                <p className="mt--20">
                  Hope you had fun - we expect to see you next year as well!
                  Kind regards, BGS-Netherlands!
                </p>
              </div>
            ) : (
              <Form id="form" style={{ padding: "5%" }}>
                <div className="hor_section">
                  <h3>Send a Christmas Card to a BGSNL member</h3>
                  <FiX
                    className="x_icon"
                    onClick={() => {
                      setShowForm(false);
                    }}
                  />
                </div>
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-12 mt--20">
                    <div className="rn-form-group">
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Your Holiday Wish{" "}
                        <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <Field
                        as="textarea"
                        placeholder="Write your holiday wish here..."
                        name="text"
                        style={{
                          padding: "12px 16px",
                          minHeight: "120px",
                          fontSize: "16px",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                          width: "100%",
                          resize: "vertical",
                        }}
                      />
                      <ErrorMessage
                        className="error"
                        name="text"
                        component="div"
                      />
                    </div>
                  </div>
                  <GifSearch value={gif} setValue={(value) => setGif(value)} />
                  <div className="col-lg-6 col-md-12 col-12 mt--20">
                    <div className="rn-form-group">
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Your Name <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <Field
                        type="text"
                        placeholder="e.g., John Doe"
                        name="sender"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          fontSize: "16px",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                        }}
                      />
                      <ErrorMessage
                        className="error"
                        name="sender"
                        component="div"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12 mt--20">
                    <div className="hor_section_nospace">
                      <Field
                        style={{ maxWidth: "30px", margin: "0 10px" }}
                        type="checkbox"
                        name="hideSender"
                      ></Field>
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#6c757d",
                          cursor: "pointer",
                          margin: 0,
                        }}
                      >
                        Hide your name from receiver
                      </label>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-12 col-12 mt--20">
                    <div className="rn-form-group">
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Receiver Full Name{" "}
                        <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <Field
                        type="text"
                        placeholder="e.g., Jane Smith"
                        name="receiver"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          fontSize: "16px",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                        }}
                      />
                      <ErrorMessage
                        className="error"
                        name="receiver"
                        component="div"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12 mt--20">
                    <div className="hor_section_nospace">
                      <Field
                        style={{ maxWidth: "30px", margin: "0 10px" }}
                        type="checkbox"
                        name="randomReceiver"
                      ></Field>
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#6c757d",
                          cursor: "pointer",
                          margin: 0,
                        }}
                      >
                        Send to random user
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="rn-button-style--2 rn-btn-reverse-green mt--20"
                >
                  {loading ? <Loader /> : <span>Send Card</span>}
                </button>
              </Form>
            )}
          </Formik>
        </ModalWindow>
      )}

      <div className="holiday-special">
        <img
          src="/assets/images/special/christmas-hat.png"
          alt="hat"
          className="special-icon"
        />
        <h3
          style={{
            color: "white",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "600",
          }}
        >
          Holiday Special
        </h3>
        <div
          className="holiday-special-btns"
          style={{
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              setShowInbox(true);
            }}
            className="rn-button-style--2 rn-btn-reverse-red rn-btn-medium-size"
          >
            Check Inbox
          </button>
          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="rn-button-style--2 rn-btn-reverse-red rn-btn-medium-size"
          >
            Send a Wish
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Christmas;
