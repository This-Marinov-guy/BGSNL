import { FiPlus } from "@/elements/ui/icons/IconlyIcons";

const PlusButton = (props) => {
  const {className, ...rest} = props;

  return (
      <FiPlus className={'btn-icon-frame green ' + className} {...rest} />
  )
}

export default PlusButton