import React, { ComponentProps, KeyboardEvent } from 'react';
import { mount, shallow } from 'enzyme';
import { mock, instance } from 'ts-mockito';

import * as Nav from '../../../utils/navFrontend';

import Checkbox from './index';

describe('Checkbox', () => {
  const mockedProps = mock<ComponentProps<typeof Checkbox>>();
  const props = instance(mockedProps);
  props.label = '';

  beforeEach(() => {
    props.onCheck = jest.fn();
  });

  it('kaller onCheck med checkbox-verdi ved change event', () => {
    const checkbox = shallow(<Checkbox {...props} />);
    const event = { target: { checked: true } };
    checkbox.simulate('change', event);

    expect(props.onCheck).toHaveBeenCalledTimes(1);
    expect(props.onCheck).toHaveBeenLastCalledWith(true);
  });

  it('kaller oncheck med checkbox-verdi ved trykk på enter-tast', () => {
    props.checked = true;
    let checkbox = mount(<Checkbox {...props} />);
    let navCheckbox = checkbox.find(Nav.Checkbox);

    const mockedEvent = mock<KeyboardEvent<HTMLInputElement>>();
    const event = instance(mockedEvent);
    event.key = 'Enter';
    let { onKeyPress } = navCheckbox.props();
    if (onKeyPress) onKeyPress(event);

    expect(props.onCheck).toHaveBeenCalledTimes(1);
    expect(props.onCheck).toHaveBeenLastCalledWith(false);

    props.checked = false;
    checkbox = mount(<Checkbox {...props} />);
    navCheckbox = checkbox.find(Nav.Checkbox);

    ({ onKeyPress } = navCheckbox.props());
    if (onKeyPress) onKeyPress(event);

    expect(props.onCheck).toHaveBeenCalledTimes(2);
    expect(props.onCheck).toHaveBeenLastCalledWith(true);
  });
});
