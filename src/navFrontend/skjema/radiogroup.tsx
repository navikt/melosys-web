import { RadioGroup as NavRadioGroup, RadioGroupProps } from "@navikt/ds-react";

function RadioGroup(props: RadioGroupProps) {
  const { size, children, ...rest } = props;
  return (
    <NavRadioGroup {...rest} size={size || "small"}>
      {children}
    </NavRadioGroup>
  );
}

export default RadioGroup;
