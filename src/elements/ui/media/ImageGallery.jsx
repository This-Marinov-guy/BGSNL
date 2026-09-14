"use client";
import { useMemo } from "react";
import PropTypes from "prop-types";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import styles from "./image-gallery.module.scss";

export default function ImageGallery({ images, src, alt, fileName, open, onClose }) {
  const slides = useMemo(() => [...new Map(images.filter((image) => image.src).map((image) =>
    [image.src, { ...image, description: image.label || image.alt, download: image.download ?? { url: image.src, filename: image.src === src ? fileName : image.alt } }])).values()], [images, src, fileName]);
  return <Lightbox className={styles.gallery} open={open} close={onClose} slides={slides.length ? slides : [{ src, alt, description: alt }]}
    index={Math.max(0, slides.findIndex((image) => image.src === src))}
    plugins={[Zoom, Download, Captions]} captions={{ descriptionTextAlign: "center" }} controller={{ aria: true, closeOnBackdropClick: true }}
    carousel={{ finite: slides.length <= 1 }} styles={{ root: { zIndex: 20000 } }} />;
}
ImageGallery.propTypes = { images: PropTypes.array.isRequired, src: PropTypes.string.isRequired,
  alt: PropTypes.string, fileName: PropTypes.string, open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired };
