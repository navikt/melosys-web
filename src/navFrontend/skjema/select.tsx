import { Select as NavSelect, SelectProps } from "@navikt/ds-react";

const Select = (props: SelectProps) => {
  const { size, children, ...rest } = props;
  return (
    <NavSelect {...rest} size={size || "small"}>
      {children}
    </NavSelect>
  );
};

export default Select;
