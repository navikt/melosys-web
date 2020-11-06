import React from 'react';

import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../skjema';

import EnkeltArbeidsforholdUtland from './enkeltArbeidsforholdUtland';

describe('EnkeltArbeidsforholdUtland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: 'feltnavn',
      className: 'cssklasse',
    };
  });

  describe('alle inputs som vises', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsforholdUtland = shallow(<EnkeltArbeidsforholdUtland {...props} />);
      const inputs = enkeltArbeidsforholdUtland.find(Nav.Input);
      const landvelger = enkeltArbeidsforholdUtland.find(Skjema.LandVelger);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      expect(landvelger.props().disabled).toBe(!props.redigerbart);
    });
  });
});
