import { useSelector } from "react-redux";
import { useAlumniRegistration } from "../../../hooks/alumni/use-alumni-registration";
import { selectUser } from "../../../redux/user";
import AlumniErrorModal from "./AlumniErrorModal";
import AlumniTypeModal from "./AlumniTypeModal";

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
