import {
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { FiImage } from "@/elements/ui/icons/IconlyIcons";

export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ImageInput = (props) => {
  const maxSizeBytes = props.maxSizeBytes ?? DEFAULT_MAX_IMAGE_SIZE_BYTES;
  const maxSizeLabel = props.maxSizeLabel ?? "5 MB";
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState(props.initialImage);
  const [isDragging, setIsDragging] = useState(false);

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

  const applyFile = (pickedFile, event) => {
    const input = fileInputRef.current;

    if (!pickedFile) {
      input?.setCustomValidity("");
      return;
    }

    const hasValidType = validFileTypes.includes(pickedFile.type);
    const hasValidSize = pickedFile.size <= maxSizeBytes;
    const validationMessage = !hasValidType
      ? "The file is not supported. Please choose a JPG or PNG image."
      : !hasValidSize
        ? `The image must be ${maxSizeLabel} or smaller.`
        : "";

    input?.setCustomValidity(validationMessage);

    if (hasValidType && hasValidSize) {
      setFile(pickedFile);
    } else {
      setFile(null);
    }

    props.onChange?.(
      event ?? {
        target: { name: props.name ?? "image", files: [pickedFile] },
        currentTarget: { name: props.name ?? "image", files: [pickedFile] },
      }
    );
  };

  const inputHandler = (event) => {
    applyFile(event.currentTarget.files?.[0], event);
  };

  const dropHandler = (event) => {
    event.preventDefault();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={`${props.className ?? ""} rn-form-group`}
      data-field-name={props.name ?? "image"}
      style={{ marginBottom: "20px" }}
    >
      <div
        className={`image_input_window${props.dropzone ? " image_input_window--dropzone" : ""}${isDragging ? " is-dragging" : ""}`}
        onClick={imageClickHandler}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={dropHandler}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            imageClickHandler();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Upload an image. JPG or PNG, maximum ${maxSizeLabel}.`}
        style={{
          width: props.dropzone ? "100%" : "120px",
          height: props.dropzone ? "auto" : "120px",
          borderRadius: props.dropzone ? "12px" : "10%",
          border: "2px dashed #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          margin: "0 auto",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          transition: "all 0.3s ease",
          ...props.style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#017363";
          e.currentTarget.style.backgroundColor = "#f0f8f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#ddd";
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }}
      >
        <input
          className="image_input_field"
          onChange={inputHandler}
          ref={fileInputRef}
          type="file"
          placeholder="Image"
          name={props.name ?? "image"}
          accept={props.accept ?? ".png,.jpg,.jpeg"}
          required={Boolean(props.required && !props.initialImage)}
          style={{ display: "none" }}
        />
        {!previewUrl ? (
          props.dropzone ? (
            <div className="image-input-empty-state">
              <span className="image-input-empty-state__icon" aria-hidden="true">
                <FiImage />
              </span>
              <span className="image-input-empty-state__copy">
                <strong>
                  Drop a profile photo here <span>or browse</span>
                </strong>
                <small>JPG or PNG · maximum {maxSizeLabel}</small>
              </span>
              <span className="image-input-avatar-fallback">
                <span
                  className="image-input-avatar-stack"
                  aria-label="Examples of assigned BGSNL avatars"
                  role="img"
                >
                  {[1, 2, 3].map((avatar) => (
                    <img
                      key={avatar}
                      src={`/assets/images/avatars/bg_other_avatar_${avatar}.jpeg`}
                      alt=""
                    />
                  ))}
                </span>
                <small>No image? We&apos;ll assign you a cute avatar.</small>
              </span>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <FiImage style={{ color: "#6c757d" }} />
              {!props.iconOnly && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    color: "#6c757d",
                  }}
                >
                  Add Photo
                </p>
              )}
            </div>
          )
        ) : props.dropzone ? (
          <div className="image-input-preview-state">
            <img src={previewUrl} alt="Selected profile preview" />
            <span>
              <strong>{file?.name ?? "Current profile photo"}</strong>
              <small>Drop another image or click to replace</small>
            </span>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10%",
            }}
          />
        )}
      </div>
      {props.errorRequired ? (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            {props.errorRequired}
          </div>
        </div>
      ) : null}
    </div>
  );
};

ImageInput.propTypes = {
  accept: PropTypes.string,
  className: PropTypes.string,
  dropzone: PropTypes.bool,
  errorRequired: PropTypes.node,
  iconOnly: PropTypes.bool,
  initialImage: PropTypes.string,
  maxSizeBytes: PropTypes.number,
  maxSizeLabel: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  style: PropTypes.object,
};

export default ImageInput;
