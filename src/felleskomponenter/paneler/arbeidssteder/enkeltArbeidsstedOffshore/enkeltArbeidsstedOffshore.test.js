import React from 'react';

import * as Skjema from '../../../skjema';

import EnkeltArbeidsstedOffshore from './enkeltArbeidsstedOffshore';

describe('EnkeltArbeidsstedOffshore', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: 'foretakUtland[0]',
    };
  });

  describe('alle inputs som vises', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsstedOffshore = shallow(<EnkeltArbeidsstedOffshore {...props} />);

      const inputs = enkeltArbeidsstedOffshore.find(Skjema.Input);
      const landvelger = enkeltArbeidsstedOffshore.find(Skjema.LandVelger);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      expect(landvelger.props().disabled).toBe(!props.redigerbart);
    });
  });
});
