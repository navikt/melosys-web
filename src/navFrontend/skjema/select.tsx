import { Select as NavSelect, SelectProps } from "@navikt/ds-react";

function Select(props: SelectProps) {
  const { size, children, ...rest } = props;
  return (
    <NavSelect {...rest} size={size || "small"}>
      {children}
    </NavSelect>
  );
}

export default Select;
