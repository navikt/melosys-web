import { Alert as NavAlert, AlertProps } from "@navikt/ds-react";

function Alert(props: AlertProps) {
  const { size, children, ...rest } = props;
  return (
    <NavAlert {...rest} size={size || "small"}>
      {children}
    </NavAlert>
  );
}

export default Alert;
