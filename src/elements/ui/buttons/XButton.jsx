import React from 'react'
import { FiX } from "react-icons/fi";

const XButton = ({onClick}, ...props) => {
  return (
      <FiX onClick={onClick} className='btn-icon-frame red' {...props}/>
  )
}

export default XButton