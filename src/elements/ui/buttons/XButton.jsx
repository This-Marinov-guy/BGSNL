import { FiX } from "@/elements/ui/icons/IconlyIcons";

const XButton = (props) => {
  const { className, ...rest } = props;

  return <FiX className={"btn-icon-frame red " + className} {...rest} />;
}

export default XButton