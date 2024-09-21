import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { Dialog } from 'primereact/dialog';
import { BIRTHDAY_MODAL } from "../../../util/defines/common";
import Confetti from 'react-confetti'
import ImageFb from '../media/ImageFb';

const BirthdayModal = () => {
  const modal = useSelector(selectModal);
  const dispatch = useDispatch();

  return (
    <Dialog header="Happy Birthday, dear member" visible={modal.includes(BIRTHDAY_MODAL)} onHide={() => dispatch(removeModal(BIRTHDAY_MODAL))} style={{ maxWidth: '80vw' }} dismissableMask>
      <Confetti />
      <p className='mt--10'>We are happy that you share the joy and help we bring to people. We want to thank you for your contribution and cheer you on for the occasion. Hope we share more memories soon!</p>
      <ImageFb
        style={{ margin: '10px auto', height: '12em' }}
        className='center_div'
        src={`/assets/images/logo/logo.webp`}
        fallback={`/assets/images/logo/logo.jpg`}
        alt="Logo"
      />
    </Dialog>
  )
}

export default BirthdayModal
