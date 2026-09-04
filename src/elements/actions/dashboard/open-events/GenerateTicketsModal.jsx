import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import CustomSpinner from "../../../ui/loading/CustomSpinner";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../../redux/notification";
import { SUCCESS_STYLE, WARNING_STYLE } from "../../../../util/defines/common";

const initialValue = { name: "", surname: "", email: "" };

const GenerateTicketsModal = ({ visible, onHide, event }) => {
  const [inputs, setInputs] = useState([initialValue]);
  const [loading, setLoading] = useState(false);

  const { sendRequest } = useHttpClient();

  const dispatch = useDispatch();

  const addInput = () => {
    setInputs([...inputs, initialValue]);
  };

  const removeInput = (index) => {
    if (inputs.length === 1) {
      return;
    }

    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const handleInputChange = (index, field, value) => {
    setInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = { ...newInputs[index], [field]: value };
      return newInputs;
    });
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    let success = false;

    for (let i = 0; i < inputs.length; i++) {
      const element = inputs[i];

      const data = {
        eventId: event.id,
        code: new Date().valueOf() - i,
        quantity: 1,
      };

      // formData
      const formData = new FormData();
      formData.append("type", "free");
      formData.append("quantity", 1);
      formData.append("origin_url", window.location.origin);
      formData.append("eventId", event.id);
      formData.append("code", data.code);
      formData.append("guestEmail", element.email);
      formData.append("guestName", element.name + " " + element.surname);
      formData.append("guestPhone", "-");

      try {
        const responseData = await sendRequest(
          "event/purchase-ticket/guest",
          "POST",
          formData
        );

        if (responseData.status) {
          success = true;
        }
      } catch (err) {
        // The shared request hook reports individual ticket failures.
      }
    }

    if (success) {
      onHide();
      dispatch(
        showNotification({
          ...SUCCESS_STYLE,
          summary: "Generating tickets executed!",
        })
      );
      setInputs([initialValue]);
    } else {
      dispatch(
        showNotification({
          ...WARNING_STYLE,
          summary: "No tickets were generated!",
        })
      );
    }

    setLoading(false);
  };

  const actions = loading ? (
    <CustomSpinner />
  ) : (
    <>
      <button
        type="button"
        onClick={onHide}
        className="rn-button-style--2 rn-btn-reverse"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="generate-guest-tickets-form"
        className="rn-button-style--2 rn-btn-reverse-green"
      >
        Submit
      </button>
    </>
  );

  return (
    <Dialog
      header="Generate Free Guest Tickets"
      visible={visible}
      style={{ maxWidth: "90%" }}
      onHide={onHide}
      dismissableMask
      footer={actions}
    >
      <form id="generate-guest-tickets-form" onSubmit={handleSubmit}>
        {inputs.map((inputSet, index) => (
          <div className="multi-input-set mt--10" key={index}>
            <div className="hor_section_nospace mobile">
              <input
                type="text"
                name={`guests[${index}].name`}
                value={inputSet.name}
                placeholder="Name"
                required
                onChange={(e) => handleInputChange(index, "name", e.target.value)}
              />
              <input
                type="text"
                name={`guests[${index}].surname`}
                value={inputSet.surname}
                placeholder="Surname"
                required
                onChange={(e) =>
                  handleInputChange(index, "surname", e.target.value)
                }
              />
              <input
                type="email"
                name={`guests[${index}].email`}
                value={inputSet.email}
                placeholder="Email"
                required
                onChange={(e) =>
                  handleInputChange(index, "email", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeInput(index)}
                className="rn-btn"
              >
                x
              </button>
            </div>
            <hr className="mt--10" />
          </div>
        ))}

        <button
          type="button"
          onClick={addInput}
          className="rn-button-style--2 rn-btn-reverse-green"
          style={{ margin: "auto" }}
        >
          Add Guest{" "}
        </button>

      </form>
    </Dialog>
  );
};

GenerateTicketsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default GenerateTicketsModal;
