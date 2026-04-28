import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import InternshipApplyModal from "../../elements/ui/modals/InternshipApplyModal";
import { useRefreshUser } from "./api-hooks";
import { selectUser } from "../../redux/user";
import { ACTIVE, DOCUMENT_TYPES, USER_STATUSES } from "../../util/defines/enum";

const InternshipApplyModalContext = createContext({
  openInternshipApplyModal: async () => false,
  closeInternshipApplyModal: () => {},
});

const getCvDocument = (user) =>
  user?.documents?.find((document) => document.type === DOCUMENT_TYPES.CV) ||
  null;

export const InternshipApplyModalProvider = ({ children }) => {
  const authUser = useSelector(selectUser);
  const { refreshUser } = useRefreshUser();
  const [modalState, setModalState] = useState({
    visible: false,
    internship: null,
    user: null,
    cvDocument: null,
    onApply: null,
    onUserRefresh: null,
  });

  const closeInternshipApplyModal = () => {
    setModalState((currentState) => ({
      ...currentState,
      visible: false,
    }));
  };

  const openInternshipApplyModal = async ({
    internship,
    user,
    onApply,
    onUserRefresh,
  }) => {
    if (!internship) {
      return false;
    }

    let resolvedUser = user;

    if (
      !resolvedUser &&
      authUser?.token &&
      authUser?.status === USER_STATUSES[ACTIVE]
    ) {
      const response = await refreshUser();
      resolvedUser = response?.user || null;
    }

    if (resolvedUser?.status !== USER_STATUSES[ACTIVE]) {
      return false;
    }

    setModalState({
      visible: true,
      internship,
      user: resolvedUser,
      cvDocument: getCvDocument(resolvedUser),
      onApply: typeof onApply === "function" ? onApply : null,
      onUserRefresh,
    });

    return true;
  };

  const modalKey =
    modalState.internship?._id ||
    modalState.internship?.id ||
    `${modalState.internship?.company || "internship"}-${modalState.internship?.specialty || "apply"}`;

  return (
    <InternshipApplyModalContext.Provider
      value={{ openInternshipApplyModal, closeInternshipApplyModal }}
    >
      {children}
      {modalState.internship && modalState.user && (
        <InternshipApplyModal
          key={modalKey}
          visible={modalState.visible}
          onHide={closeInternshipApplyModal}
          internship={modalState.internship}
          cvDocument={modalState.cvDocument}
          onApply={modalState.onApply}
          onUserRefresh={modalState.onUserRefresh}
        />
      )}
    </InternshipApplyModalContext.Provider>
  );
};

InternshipApplyModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useInternshipApplyModal = () =>
  useContext(InternshipApplyModalContext);
