import React, { Component, ComponentProps, ChangeEvent, KeyboardEvent } from "react";

import * as Nav from "../../../utils/navFrontend";

type NavCheckboxProps = ComponentProps<typeof Nav.Checkbox>;
type FilteredNavCheckboxProps = Omit<NavCheckboxProps, "onChange" | "onKeyPress">;

interface onCheckProperties {
  checked: boolean;
  value: any;
}

interface CheckboxProps extends FilteredNavCheckboxProps {
  onCheck: (properties: onCheckProperties) => void;
}

class Checkbox extends Component<CheckboxProps> {
  private navCheckbox: HTMLInputElement | null = null;

  render() {
    const { onCheck, ...rest } = this.props;

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && this.navCheckbox) {
        onCheck({
          checked: !this.navCheckbox.checked,
          value: rest.value,
        });
      }
    };

    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      onCheck({
        checked: e.target.checked,
        value: rest.value,
      });
    };

    return (
      <Nav.Checkbox
        onChange={changeHandler}
        onKeyPress={handleKeyPress}
        checkboxRef={(ref) => {
          this.navCheckbox = ref;
        }}
        {...rest}
      />
    );
  }
}

export default Checkbox;
