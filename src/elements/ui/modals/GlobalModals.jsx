import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/user';
import { useAlumniRegistration } from '../../../hooks/alumni/use-alumni-registration';
import AlumniTypeModal from './AlumniTypeModal';
import AlumniErrorModal from './AlumniErrorModal';

const GlobalModals = () => {
  const { showTypeModal, setShowTypeModal, showErrorModal, setShowErrorModal } = useAlumniRegistration();
  const user = useSelector(selectUser);

  return (
    <>
      <AlumniTypeModal 
        isOpen={showTypeModal} 
        onClose={() => setShowTypeModal(false)} 
      />
      <AlumniErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
      />
    </>
  );
};

export default GlobalModals;
