import React, { useState, useRef, useCallback, useEffect } from "react";
import { FiX, FiUpload, FiInfo } from "react-icons/fi";
import { Tooltip } from "primereact/tooltip";
import ImageFb from "../ui/media/ImageFb";

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
const DEFAULT_MAX_DIMENSION = 1000; // Max width or height
const DEFAULT_VALID_FILE_TYPES = [
  "image/jpeg", 
  "image/jpg", 
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf"
];

const MultiImageUpload = ({ 
  existingImages = [], 
  onImagesChange,
  name = "images",
  maxImages = DEFAULT_MAX_IMAGES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxDimension = DEFAULT_MAX_DIMENSION,
  validFileTypes = DEFAULT_VALID_FILE_TYPES,
  label = "Images",
  tooltip = "Upload multiple images",
  showInfo = true,
  enableReorder = true,
  className = ""
}) => {
  const [images, setImages] = useState(() => {
    // Initialize with existing images (URLs) and mark them as existing
    return existingImages.map((url, index) => {
      const isPdf = typeof url === 'string' && url.toLowerCase().endsWith('.pdf');
      return {
        id: `existing-${index}`,
        url,
        file: null,
        isExisting: true,
        preview: url,
        isPdf
      };
    });
  });
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);
  const tooltipId = `tooltip-${name}`;

  // Update images when existingImages prop changes
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existingImageObjects = existingImages.map((url, index) => {
        const isPdf = typeof url === 'string' && url.toLowerCase().endsWith('.pdf');
        return {
          id: `existing-${index}`,
          url,
          file: null,
          isExisting: true,
          preview: url,
          isPdf
        };
      });
      setImages(existingImageObjects);
    }
  }, [existingImages]);

  // Resize image using canvas (skip for PDFs)
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      // Skip resizing for PDF files
      if (file.type === 'application/pdf') {
        resolve(file);
        return;
      }

      // Handle HEIC/HEIF - browsers may not support these natively
      // Try to convert or use as-is if browser doesn't support
      if (file.type === 'image/heic' || file.type === 'image/heif') {
        // For HEIC/HEIF, we'll try to process it, but if it fails, use the original
        // Note: Browser support for HEIC is limited, so we may need to use the file as-is
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions maintaining aspect ratio
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }

            // Create canvas and resize
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg', // Convert HEIC to JPEG
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              },
              'image/jpeg',
              0.9 // Quality
            );
          };
          img.onerror = () => {
            // If browser doesn't support HEIC, use file as-is
            resolve(file);
          };
          img.src = e.target.result;
        };
        reader.onerror = () => {
          // If reading fails, use file as-is
          resolve(file);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Standard image processing for JPEG, PNG, etc.
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            file.type,
            0.9 // Quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Validate file
  const validateFile = (file) => {
    // Check for HEIC/HEIF with alternative MIME types that browsers might use
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    const isHeic = fileType.includes('heic') || fileType.includes('heif') || 
                   fileName.endsWith('.heic') || fileName.endsWith('.heif');
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
    
    // Check if file type is valid
    const isValidType = validFileTypes.includes(file.type) || isHeic || isPdf;
    
    if (!isValidType) {
      const types = validFileTypes
        .map(t => {
          if (t === 'application/pdf') return 'PDF';
          const ext = t.split('/')[1].toUpperCase();
          return ext === 'JPG' ? 'JPG/JPEG' : ext;
        })
        .join(', ');
      return `Invalid file format. Please upload ${types} files only.`;
    }
    const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
    if (file.size > maxFileSize) {
      return `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    const fileArray = Array.from(files);
    setError(null);

    // Check total count
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. Please remove some images first.`);
      return;
    }

    const newImages = [];
    const errors = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        // Process file (resize if image, keep as-is if PDF)
        const processedFile = await resizeImage(file);
        
        // Create preview URL
        // For PDFs, we'll use a generic PDF icon or the file itself
        let preview;
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          // For PDF, create a data URL or use a placeholder
          preview = URL.createObjectURL(processedFile);
        } else {
          preview = URL.createObjectURL(processedFile);
        }
        
        newImages.push({
          id: `new-${Date.now()}-${Math.random()}`,
          url: null,
          file: processedFile,
          isExisting: false,
          preview,
          isPdf: file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        });
      } catch (err) {
        errors.push(`${file.name}: Failed to process file.`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      notifyChange(updatedImages);
    }
  }, [images, maxImages, maxFileSize, maxDimension, validFileTypes]);

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
      // Reset input
      e.target.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove image
  const handleRemove = (id) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove && imageToRemove.preview && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    notifyChange(updatedImages);
  };

  // Drag and drop reordering
  const handleDragStart = (index) => {
    if (enableReorder) {
      setDraggedIndex(index);
    }
  };

  const handleDragOverItem = (e, index) => {
    if (!enableReorder) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
    notifyChange(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Notify parent of changes
  const notifyChange = (updatedImages) => {
    if (onImagesChange) {
      // Separate existing (URLs) and new files
      const existingUrls = updatedImages
        .filter(img => img.isExisting)
        .map(img => img.url);
      
      const newFiles = updatedImages
        .filter(img => !img.isExisting)
        .map(img => img.file);

      onImagesChange({
        existing: existingUrls,
        newFiles: newFiles,
        all: updatedImages
      });
    }
  };

  const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
  const fileTypesStr = validFileTypes
    .map(t => {
      if (t === 'application/pdf') return 'PDF';
      if (t === 'image/jpg') return 'JPG/JPEG';
      const ext = t.split('/')[1].toUpperCase();
      return ext;
    })
    .join('/');
  
  // Build accept string for file input
  const acceptString = validFileTypes.join(',') + ',.heic,.heif';

  return (
    <div className={`multi-image-upload ${className}`}>
      {showInfo && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ gap: "8px", marginBottom: "10px" }}
        >
          <h5 style={{ margin: 0, color: "#6c757d" }}>
            {label}
          </h5>
          {tooltip && (
            <>
              <Tooltip target={`.${tooltipId}`} />
              <FiInfo
                className={tooltipId}
                style={{ cursor: "help", color: "#6c757d" }}
                data-pr-tooltip={tooltip}
                data-pr-position="right"
              />
            </>
          )}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload style={{ fontSize: "32px", color: "#6c757d", marginBottom: "10px" }} />
          <p style={{ margin: "5px 0", color: "#6c757d" }}>
            Click or drag and drop to upload files
          </p>
          <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
            Max {maxImages} files, {maxSizeMB}MB each, {fileTypesStr} only
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptString}
            multiple
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ 
          color: "#dc3545", 
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f8d7da",
          borderRadius: "4px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="images-grid" style={{ marginTop: "20px" }}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className="image-item"
              draggable={enableReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                position: "relative",
                cursor: enableReorder ? "move" : "default",
                opacity: draggedIndex === index ? 0.5 : 1
              }}
            >
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(image.id);
                }}
                aria-label="Remove image"
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "rgba(220, 53, 69, 0.9)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  color: "white"
                }}
              >
                <FiX size={16} />
              </button>
              <div className="image-preview">
                {image.isPdf ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "2px dashed #dee2e6",
                      padding: "10px"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "8px",
                        color: "#dc3545"
                      }}
                    >
                      📄
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6c757d",
                        textAlign: "center",
                        fontWeight: "600"
                      }}
                    >
                      PDF
                    </span>
                  </div>
                ) : (
                  <ImageFb
                    src={image.preview}
                    alt={`Image ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                )}
              </div>
              {enableReorder && index === 0 && images.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    left: "5px",
                    background: "rgba(1, 115, 99, 0.9)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}
                >
                  Drag to reorder
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {showInfo && (
        <p style={{ marginTop: "15px", fontSize: "12px", color: "#6c757d" }}>
          <small>* Maximum {maxImages} files allowed</small>
          <br />
          <small>* Images will be automatically resized to max {maxDimension}px width/height</small>
          <br />
          <small>* Maximum file size: {maxSizeMB}MB per file</small>
        </p>
      )}
    </div>
  );
};

export default MultiImageUpload;

