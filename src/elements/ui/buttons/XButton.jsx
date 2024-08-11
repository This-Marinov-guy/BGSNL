import React from 'react'
import { FiX } from "react-icons/fi";

const XButton = (props) => {
  const { className, ...rest } = props;

  return (
      <FiX className='btn-icon-frame red' {...props}/>
  )
}

export default XButton