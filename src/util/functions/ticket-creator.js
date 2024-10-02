import QRCode from "qrcode";
import { resizeFile } from "./helpers";

export const createQrCodeCheckGuest = (data) => {
  return `${process.env.REACT_APP_PUBLIC_URL}/user/check-guest-list?event=${data.eventId}&code=${data.code}&count=${data?.quantity ?? 1}`;
}

export const createCustomerTicket = async (ticketImage, name, surname, color = "#faf9f6", qrLink = '', withName = true) => {
  // Create a canvas element, add the image and text, covert to blob
  //for 1500 x 485 images
  //for 2000 x 647 images
  const response = await fetch(ticketImage);
  const ticketImageBlob = await response.blob();
  const resizedTicketImage = await resizeFile(ticketImageBlob);

  var canvas = document.createElement("canvas");
  var layout = canvas.getContext("2d");
  let ticket = new Image();
  ticket.crossOrigin = "anonymous"; // This enables CORS on the image
  ticket.src = URL.createObjectURL(resizedTicketImage);

  await new Promise((resolve, reject) => {
    ticket.onload = function () {
      resolve();
    };

    ticket.onerror = function (error) {
      reject(error);
    };
  });

  //image
  canvas.width = ticket.naturalWidth;
  canvas.height = ticket.naturalHeight;
  layout.drawImage(
    ticket,
    0,
    0,
    ticket.naturalWidth,
    ticket.naturalHeight
  );

  // text
  if (withName) {
    layout.rotate(4.71);
    layout.font = "52px Archive";
    layout.fillStyle = color;
    layout.textAlign = "center";
    layout.strokeText(name, -255, 1170);
    layout.fillText(name, -255, 1170);
  
    layout.font = "52px Archive";
    layout.fillStyle = color;
    layout.textAlign = "center";
    layout.strokeText(surname, -255, 1230);
    layout.fillText(surname, -255, 1230);
  }

  // Qr code
  if (qrLink) {
    const qrCodeCanvas = document.createElement("canvas");
    // Create the QR code at a larger size
    await QRCode.toCanvas(qrCodeCanvas, qrLink, { width: 200, margin: 0 });

    // Calculate the desired size (e.g., 40x40 pixels)
    const desiredSize = 80;

    // Draw QR Code on the ticket, scaling it down
    layout.rotate(-4.71);
    layout.drawImage(
      qrCodeCanvas,
      1326,
      canvas.height - 380,
      desiredSize,
      desiredSize
    );
  }

  // Data URL
  const ticketUrl = canvas.toDataURL("image/webp");

  // blob
  const ticketBlob = await new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/webp")
  );

  return { ticketUrl, ticketBlob };
}
