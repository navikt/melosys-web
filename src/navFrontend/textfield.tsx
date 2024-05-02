import { TextField as NavTextField, TextFieldProps } from "@navikt/ds-react";

const TextField = (props: TextFieldProps) => {
  const { size, children, ...rest } = props;
  return (
    <NavTextField {...rest} size={size || "small"}>
      {children}
    </NavTextField>
  );
};

export default TextField;
