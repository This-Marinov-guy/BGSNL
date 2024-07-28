import React from 'react'
import { FiPlus } from "react-icons/fi";

const PlusButton = ({onClick}, ...props) => {
  return (
      <FiPlus onClick={onClick} className='btn-icon-frame' {...props} />
  )
}

export default PlusButton