import React from "react";
import { Field, ErrorMessage } from "formik";
import ImageInput from "../../inputs/common/ImageInput";
import ImageSelection from "../../inputs/ImageSelection";
import { FileUpload } from "primereact/fileupload";

const ImagesSection = ({ values, setFieldValue, dispatch, showNotification }) => {
  // Function to validate image ratio
  const isImageCorrectRatio = (file, margin = 0.02) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          resolve(Math.abs(ratio - 1500 / 485) < margin);
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  };

  // Default fallback for background images
  const bgs = values.bgImageOptions || []; // Ensure options is always an array

  return (
    <div>
      <h3 className="mt--30 label">Images</h3>
      <div className="row">
        {/* Poster Image Section */}
        <div className="col-lg-6 col-md-6 col-12 mt--20">
          <hr />
          <h5 className="center_text">Poster Image</h5>
          <ImageInput
            initialImage={values.poster}
            onChange={(event) => setFieldValue("poster", event.target.files[0])}
          />
          <ErrorMessage className="error center_div" name="poster" component="div" />
        </div>

        {/* Ticket Image Section */}
        <div className="col-lg-6 col-md-6 col-12 mt--20">
          <hr />
          <h5 className="center_text">Ticket Image</h5>
          <ImageInput
            initialImage={values.ticketImg}
            onChange={(event) => {
              isImageCorrectRatio(event.target.files[0])
                .then((isCorrect) => {
                  if (isCorrect) {
                    setFieldValue("ticketImg", event.target.files[0]);
                  } else {
                    dispatch(
                      showNotification({
                        severity: "warn",
                        detail: "Image ratio is incorrect. Please select another image!",
                      })
                    );
                  }
                })
                .catch(() => {
                  dispatch(
                    showNotification({
                      severity: "danger",
                      detail: "Error uploading image. Please try again!",
                    })
                  );
                });
            }}
          />
          <p className="mt--10 information center_text">
            *Ticket must be jpg or png with a resolution ratio of 300:97 (e.g., 1500 x 485).
          </p>
          <ErrorMessage className="error center_div" name="ticketImg" component="div" />
        </div>
      </div>

      {/* Additional Images and Background Section */}
      <div className="row center_text">
        <div className="col-lg-6 col-12 mt--20">
          <hr />
          <h5>Extra Description Images</h5>
          <FileUpload
            name="extraImages"
            onInput={(e) => setFieldValue("extraImages", e.files)}
            multiple
            accept="image/*"
            maxFileSize={100000000}
            emptyTemplate={<h4 className="m-0">Drag and drop images here to upload.</h4>}
          />
          <p>
            <small>* Submit no more than 3 images.</small>
            <br />
            <small>* Any extra images will not be received.</small>
          </p>
        </div>

        {/* Background Image Section */}
        <div className="col-lg-6 col-12 mt--20">
          <hr />
          <h5 className="mt--30">Background Image (hover for preview)</h5>
          <div className="rn-form-group" style={{ margin: "auto", width: "250px" }}>
            <ImageSelection
              placeholder="Choose default background"
              initialValue={values.bgImage}
              onSelect={(option) => setFieldValue("bgImage", option)}
              options={bgs} // Ensure options is an array
            />
            <h5>Or Upload Your Own</h5>
            <ImageInput
              initialImage={values.bgImageExtra}
              style={{ height: "150px" }}
              onChange={(event) => {
                setFieldValue("bgImageExtra", event.target.files[0]);
                setFieldValue("bgImageSelection", 2);
              }}
            />
            <p className="mt--10 information center_text">*Choose a wide image for better display.</p>

            {/* Background Selection */}
            {values.bgImage && values.bgImageExtra && (
              <div className="col-12" style={{ margin: "auto" }}>
                <h5 className="center_text">Select which one to display</h5>
                <div className="center_div" style={{ gap: "50px" }}>
                  <p className="center_div">
                    <Field type="radio" name="bgImageSelection" value={1} /> Default Backgrounds
                  </p>
                  <p className="center_div">
                    <Field type="radio" name="bgImageSelection" value={2} /> Extra Background
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesSection;
