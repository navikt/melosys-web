import React from 'react';

import Checkbox, { InnerCheckboxComponent } from './checkbox';

describe('Checkbox', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: '',
      className: '',
    };
  });

  it('viser en Field komponent med korrekte props', () => {
    props.feltNavn = 'test';
    props.className = 'testclass';
    const checkbox = shallow(<Checkbox {...props} />);
    const field = checkbox.find('Field');

    expect(field).toHaveLength(1);
    expect(field.props().name).toBe(props.feltNavn);
    expect(field.props().className).toBe(props.className);
  });
});

describe('Innercheckboxcomponent', () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: '',
      errorMessage: [''],
      submitOnChange: false,
      input: { value: false },
      meta: {
        error: '',
        touched: false,
        active: false,
        dispatch: jest.fn(),
      },
      onClick: jest.fn(),
      disabled: false,
    };
  });

  it('viser en NavCheckbox med korrekte props', () => {
    props.label = 'test';
    props.input = { value: true };
    props.onClick = jest.fn();
    props.disabled = true;
    const innerCheckboxComponent = shallow(<InnerCheckboxComponent {...props} />);
    const navCheckbox = innerCheckboxComponent.find('Checkbox');

    expect(navCheckbox.find('Checkbox')).toHaveLength(1);
    expect(navCheckbox.props().label).toBe(props.label);
    expect(navCheckbox.props().checked).toBe(props.input.value);
    expect(navCheckbox.props().onClick).toBe(props.onClick);
    expect(navCheckbox.props().disabled).toBe(props.disabled);
  });

  describe('ved endring av checkbox', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('kall redux form dispatch dersom submitOnChange prop er true', () => {
      props.meta = {
        error: '',
        touched: false,
        active: false,
        dispatch: jest.fn(),
      };
      props.submitOnChange = true;
      const innerCheckboxComponent = shallow(<InnerCheckboxComponent {...props} />);
      const navCheckbox = innerCheckboxComponent.find('Checkbox');

      navCheckbox.simulate('change');

      jest.runAllTimers();

      expect(props.meta.dispatch).toHaveBeenCalled();
    });

    it('ikke kall redux form dispatch dersom submitOnChange prop er false', () => {
      props.meta = {
        error: '',
        touched: false,
        active: false,
        dispatch: jest.fn(),
      };
      props.submitOnChange = false;
      const innerCheckboxComponent = shallow(<InnerCheckboxComponent {...props} />);
      const navCheckbox = innerCheckboxComponent.find('Checkbox');

      navCheckbox.simulate('change');

      jest.runAllTimers();

      expect(props.meta.dispatch).not.toHaveBeenCalled();
    });
  });
});
