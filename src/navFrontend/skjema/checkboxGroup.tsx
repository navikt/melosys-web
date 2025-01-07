import { CheckboxGroup as NavCheckboxGroup, CheckboxGroupProps } from "@navikt/ds-react";

function CheckboxGroup(props: CheckboxGroupProps) {
  const { size, children, ...rest } = props;
  return (
    <NavCheckboxGroup {...rest} size={size || "small"}>
      {children}
    </NavCheckboxGroup>
  );
}

export default CheckboxGroup;
