import React from 'react';

import Radio, { InnerInputComponent } from './radio';

describe('Radio', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: '',
      className: '',
      id: '1',
    };
  });

  it('viser en redux form Field komponent', () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find('Field')).toHaveLength(1);
  });

  it('sender className prop korrekt', () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find('Field').props().className).toBe(props.className);
  });

  it('sender id prop korrekt', () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find('Field').props().id).toBe(props.id);
  });

  it('sender feltnavn prop korrekt', () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find('Field').props().name).toBe(props.feltNavn);
  });
});

describe('InnerInputComponent', () => {
  let props = null;

  beforeEach(() => {
    props = {
      input: {
        value: '',
        name: '',
      },
      meta: {
        error: '',
        touched: false,
        active: true,
        dispatch: jest.fn(),
      },
      forhandsvalgt: false,
      label: '',
    };
  });

  it('viser en Nav Radio komponent', () => {
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find('Radio')).toHaveLength(1);
  });

  describe('setter checked-prop korrekt', () => {
    each([
      [true, false, true, true],
      [false, false, false, true],
      [true, true, false, true],
      [false, true, false, false],
      [true, false, false, false],
    ]).it('gitt props input.value = %p, value = %p, forhandsvalgt = %p, sett checked = %p', (inputValue, value, forhandsvalgt, expectedChecked) => {
      props.input.value = inputValue;
      props.value = value;
      props.forhandsvalgt = forhandsvalgt;
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.props().checked).toBe(expectedChecked);
    });
  });

  describe('setter feil-prop korrekt', () => {
    each([
      ['error', false, true, undefined],
      ['error', true, true, undefined],
      ['', true, false, undefined],
    ]).it('gitt props meta.error = %p, meta.touched = %p, meta.active = %p, sett feil = %p', (metaError, metaTouched, metaActive, expectedError) => {
      props.meta.error = metaError;
      props.meta.touched = metaTouched;
      props.meta.active = metaActive;
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.props().feil).toBe(expectedError);
    });

    each([
      ['error', true, false, { feilmelding: 'error' }],
    ]).it('gitt props meta.error = %p, meta.touched = %p, meta.active = %p, sett feil = %p', (metaError, metaTouched, metaActive, expectedError) => {
      props.meta.error = metaError;
      props.meta.touched = metaTouched;
      props.meta.active = metaActive;
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.props().feil.feilmelding).toBe(expectedError.feilmelding);
    });
  });

  describe('Radio-komponent', () => {
    it('ved blur, kall meta sin dispatch', () => {
      props.meta.dispatch = jest.fn();
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      innerInputComponent.find('Radio').simulate('blur');

      expect(props.meta.dispatch).toHaveBeenCalled();
    });
  });
});
