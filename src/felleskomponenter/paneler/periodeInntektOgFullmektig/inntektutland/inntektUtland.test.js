import React from 'react';

import * as Skjema from '../../../skjema';

import { Inntekt } from './inntektUtland';

describe('InntektUtland', () => {
  const props = {
    redigerbart: false,
  };

  const inntekt = shallow(<Inntekt {...props} />);

  it('disabled settes for alle inputs', () => {
    const inputFelter = inntekt.find(Skjema.Input);

    inputFelter.forEach(inputFelt => {
      expect(inputFelt.props().disabled).toBe(!props.redigerbart);
    });
  });

  it('disabled settes for alle checkboxer', () => {
    const checkboxer = inntekt.find(Skjema.Checkbox);

    checkboxer.forEach(checkbox => {
      expect(checkbox.props().disabled).toBe(!props.redigerbart);
    });
  });
});
