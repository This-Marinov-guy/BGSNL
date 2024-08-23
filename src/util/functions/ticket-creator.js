import QRCode from "qrcode";

export const createCustomerTicket = async (ticketImage, name, surname, color = "#faf9f6", qrLink = '') => {
  // Create a canvas element, add the image and text, covert to blob
  //for 1500 x 485 images
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
      console.log("Image loaded successfully.");
      resolve();
    };

    ticket.onerror = function (error) {
      console.log("Failed to load image:", error);
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

  if (qrLink) {
    const qrCodeCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCodeCanvas, qrLink, { width: 60, margin: 0 });

    // Draw QR Code on the ticket
    layout.rotate(-4.71);
    layout.drawImage(qrCodeCanvas, 1337, canvas.height - 350);
  }

  // Data URL
  const ticketUrl = canvas.toDataURL("image/webp");

  // blob
  const ticketBlob = await new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/webp")
  );

  return { ticketUrl, ticketBlob };
}
