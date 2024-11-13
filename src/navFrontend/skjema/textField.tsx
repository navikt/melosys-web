import { TextField as NavTextField, TextFieldProps } from "@navikt/ds-react";
import "./textfield.css";

const TextField = (props: TextFieldProps) => {
  const { size, children, className, ...rest } = props;
  return (
    <NavTextField {...rest} size={size || "small"} className={`melosys-textfield ${className ?? ""}`}>
      {children}
    </NavTextField>
  );
};

export default TextField;
