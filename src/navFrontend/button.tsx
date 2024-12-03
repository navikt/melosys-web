import { Button as NavButton, ButtonProps } from "@navikt/ds-react";

function Button(props: ButtonProps) {
  const { size, children, ...rest } = props;
  return (
    <NavButton {...rest} size={size || "small"}>
      {children}
    </NavButton>
  );
}

export default Button;
