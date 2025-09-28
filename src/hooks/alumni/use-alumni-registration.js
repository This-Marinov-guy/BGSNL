import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { selectUser } from "../../redux/user";
import { ALUMNI } from "../../util/defines/common";
import { decodeJWT } from "../../util/functions/authorization";

// Create a singleton state that persists across component instances
let globalShowTypeModal = false;
let globalShowErrorModal = false;
let settersRegistry = [];

const registerSetters = (setTypeModal, setErrorModal) => {
  settersRegistry.push({ setTypeModal, setErrorModal });
  return () => {
    settersRegistry = settersRegistry.filter(
      (setter) => setter.setTypeModal !== setTypeModal
    );
  };
};

const updateAllModals = (typeModalState, errorModalState) => {
  globalShowTypeModal = typeModalState;
  globalShowErrorModal = errorModalState;

  settersRegistry.forEach((setter) => {
    setter.setTypeModal(typeModalState);
    setter.setErrorModal(errorModalState);
  });
};

export const useAlumniRegistration = () => {
  const [showTypeModal, setShowTypeModal] = useState(globalShowTypeModal);
  const [showErrorModal, setShowErrorModal] = useState(globalShowErrorModal);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unregister = registerSetters(setShowTypeModal, setShowErrorModal);
    return unregister;
  }, []);

  const handleAlumniRegistrationClick = (e) => {
    if (e) {
      e.preventDefault();
    }

    // If user is not logged in, navigate to registration page
    if (!user?.token) {
      navigate("/alumni/register");
      return;
    }

    // Check if user is already an alumni
    if (
      user?.roles?.includes(ALUMNI) ||
     ( decodeJWT(user?.token)["userId"] ?? '').includes(ALUMNI)
    ) {
      updateAllModals(false, true); // Show error modal

      return;
    }

    // Show type selection modal for logged-in non-alumni users
    updateAllModals(true, false); // Show type modal
  };

  // Custom setters that update the global state
  const setGlobalShowTypeModal = (value) => {
    updateAllModals(value, showErrorModal);
  };

  const setGlobalShowErrorModal = (value) => {
    updateAllModals(showTypeModal, value);
  };

  return {
    showTypeModal,
    setShowTypeModal: setGlobalShowTypeModal,
    showErrorModal,
    setShowErrorModal: setGlobalShowErrorModal,
    handleAlumniRegistrationClick,
    isUserLoggedIn: !!user?.token,
    isUserAlumni: user?.roles?.includes(ALUMNI),
  };
};
