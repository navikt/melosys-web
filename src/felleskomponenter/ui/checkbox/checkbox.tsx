import { ChangeEvent, ComponentProps } from "react";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

type NavCheckboxProps = ComponentProps<typeof Nav.Checkbox>;
type FilteredNavCheckboxProps = Omit<NavCheckboxProps, "onChange" | "onKeyPress" | "children">;

interface onCheckProperties {
  checked: boolean;
  value: any;
}

interface CheckboxProps extends FilteredNavCheckboxProps {
  onCheck?: (properties: onCheckProperties) => void;
  label: string;
}

const Checkbox = (props: CheckboxProps) => {
  const { onCheck, label, ...rest } = props;

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    onCheck?.({
      checked: e.target.checked,
      value: rest.value,
    });
  };

  return (
    <Nav.Checkbox onChange={changeHandler} {...rest} id={rest.id ?? Utils._uuid()}>
      {label}
    </Nav.Checkbox>
  );
};

export default Checkbox;
