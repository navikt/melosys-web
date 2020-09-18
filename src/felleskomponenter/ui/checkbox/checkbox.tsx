import React, { Component, ComponentProps, ChangeEvent, KeyboardEvent } from 'react';

import * as Nav from '../../../utils/navFrontend';

type NavCheckboxProps = ComponentProps<typeof Nav.Checkbox>;
type FilteredNavCheckboxProps = Omit<NavCheckboxProps, 'onChange' | 'onKeyPress'>;

interface CheckboxProps extends FilteredNavCheckboxProps {
  onCheck: (checked: boolean) => void,
}

class Checkbox extends Component<CheckboxProps> {
  private navCheckbox: HTMLInputElement | null = null;

  render() {
    const {
      onCheck,
      ...rest
    } = this.props;

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && this.navCheckbox) {
        onCheck(!this.navCheckbox.checked);
      }
    };

    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      onCheck(e.target.checked);
    };

    return (
      <Nav.Checkbox
        onChange={changeHandler}
        onKeyPress={handleKeyPress}
        checkboxRef={ref => { this.navCheckbox = ref; }}
        {...rest}
      />
    );
  }
}

export default Checkbox;
