import React from 'react'
import { FiPlus } from "react-icons/fi";

const PlusButton = (props) => {
  const {className, ...rest} = props;

  return (
      <FiPlus className={'btn-icon-frame green ' + className} {...rest} />
  )
}

export default PlusButton