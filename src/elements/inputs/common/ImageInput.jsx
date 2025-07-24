import React, { useState, useEffect, useRef } from "react";
import { FiImage } from "react-icons/fi";

const ImageInput = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState(props.initialImage);
  const [isValid, setIsValid] = useState(true);

  const fileInputRef = useRef(null);

  const imageClickHandler = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const validFileTypes = ["image/jpg", "image/jpeg", "image/png"];

  const inputHandler = (event) => {
    //set image
    let pickedFile = event.target.files[0];
    if (!validFileTypes.find((type) => type === pickedFile.type)) {
      setFile(null)
      setIsValid(false);
      return;
    }
    if (event.target.files || event.target.files.length === 1) {
      setFile(pickedFile);
      setIsValid(true);
      return;
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className={props.className + " rn-form-group"} style={{ marginBottom: "20px" }}>
      <div 
        className="image_input_window" 
        onClick={imageClickHandler} 
        style={{
          ...props.style,
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "2px dashed #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          margin: "0 auto",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "#017363";
          e.target.style.backgroundColor = "#f0f8f6";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "#ddd";
          e.target.style.backgroundColor = "#f8f9fa";
        }}
      >
        <input
          className="image_input_field"
          onInput={inputHandler}
          onChange={props.onChange}
          value={props.value}
          ref={fileInputRef}
          type="file"
          placeholder="Image"
          name="image"
          accept=".png,.jpg,.jpeg"
          style={{ display: "none" }}
        />
        {!previewUrl ? (
          <div style={{ textAlign: "center" }}>
            <FiImage style={{ fontSize: "2rem", color: "#6c757d" }} />
            <p style={{ fontSize: "0.7rem", margin: "5px 0 0 0", color: "#6c757d" }}>
              Add Photo
            </p>
          </div>
        ) : (
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%"
            }}
          />
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        {props.errorRequired}
        {!isValid && (
          <p className="error" style={{ fontSize: "0.8rem", margin: "5px 0" }}>
            The file is not supported, please try again
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageInput;
