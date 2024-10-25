import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import CustomSpinner from "../../../ui/loading/CustomSpinner";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { encryptData } from "../../../../util/functions/helpers";
import { createCustomerTicket, createQrCodeCheckGuest } from "../../../../util/functions/ticket-creator";
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

  const handleSubmit = async () => {
    setLoading(true);
    let success = false;

    for (let i = 0; i < inputs.length; i++) {
      const element = inputs[i];

      if (!element.name || !element.surname || !element.email) {
        continue;
      }

      const data = {
        eventId: event.id,
        code: new Date().valueOf() - i,
        quantity: 1,
      };

      const hasQR = event.ticketQR ?? false;
      const qrCode = hasQR ? createQrCodeCheckGuest(data) : "";

      const { ticketBlob } = await createCustomerTicket(
        event.ticketImg,
        element.name,
        element.surname,
        event.ticketColor,
        qrCode,
        event.ticketName
      );

      // formData
      const formData = new FormData();
      formData.append(
        "image",
        ticketBlob,
        event.id + "_" + element.name + element.surname + "_GUEST"
      );
      formData.append("region", event.region);
      formData.append("quantity", 1);
      formData.append("origin_url", window.location.origin);
      formData.append("method", "buy_guest_ticket");
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
      } catch (err) {}
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

  return (
    <Dialog
      header="Generate Free Guest Tickets"
      visible={visible}
      style={{ maxWidth: "90%" }}
      onHide={onHide}
      dismissableMask
    >
      {inputs.map((inputSet, index) => (
        <div className="multi-input-set mt--10" key={index}>
          <div className="hor_section_nospace mobile">
            <input
              type="text"
              value={inputSet.name}
              placeholder={`Name`}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
            <input
              type="text"
              value={inputSet.surname}
              placeholder={`Surname`}
              onChange={(e) =>
                handleInputChange(index, "surname", e.target.value)
              }
            />
            <input
              type="email"
              value={inputSet.email}
              placeholder={`Email`}
              onChange={(e) =>
                handleInputChange(index, "email", e.target.value)
              }
            />
            <button onClick={() => removeInput(index)} className="rn-btn">
              x
            </button>
          </div>
          <hr className="mt--10" />
        </div>
      ))}

      <button
        onClick={addInput}
        className="rn-button-style--2 rn-btn-reverse-green"
        style={{ margin: "auto" }}
      >
        Add Guest{" "}
      </button>

      <div className="mt--40 center_div">
        {loading ? (
          <CustomSpinner />
        ) : (
          <>
            <button
              onClick={onHide}
              className="rn-button-style--2 rn-btn-reverse mr--5"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              onClick={handleSubmit}
              className="rn-button-style--2 rn-btn-reverse-green"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default GenerateTicketsModal;
