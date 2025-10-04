import React from "react";
import PropTypes from "prop-types";
import { useAlumniRegistration } from "../../../hooks/alumni/use-alumni-registration";

const AlumniRegistrationButton = ({ 
  children, 
  className = "rn-button-style--2 rn-btn-reverse-green", 
  style = {}, 
  linkStyle = {},
  asLink = true,
  onClick
}) => {
  const { setShowTypeModal } = useAlumniRegistration();

  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Always show the type modal when button is clicked
    setShowTypeModal(true);
    
    if (onClick) onClick(e);
  };

  if (asLink) {
  return (
    <a
      href="#"
      className={className}
      style={linkStyle}
      onClick={handleClick}
    >
      {children}
    </a>
  );
  }

  return (
    <button
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

AlumniRegistrationButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  linkStyle: PropTypes.object,
  asLink: PropTypes.bool,
  onClick: PropTypes.func
};

export default AlumniRegistrationButton;
