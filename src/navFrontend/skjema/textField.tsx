import { TextField as NavTextField, TextFieldProps } from "@navikt/ds-react";
import "./textField.less";

function TextField(props: TextFieldProps) {
  const { size, children, className, ...rest } = props;
  return (
    <NavTextField {...rest} size={size || "small"} className={`melosys-textfield ${className ?? ""}`}>
      {children}
    </NavTextField>
  );
}

export default TextField;
