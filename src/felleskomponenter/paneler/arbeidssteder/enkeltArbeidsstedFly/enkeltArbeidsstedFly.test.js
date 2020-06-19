import React from 'react';

import * as Skjema from '../../../skjema';

import EnkeltArbeidsstedFly from './enkeltArbeidsstedFly';

describe('EnkeltArbeidsstedFly', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: 'foretakUtland[0]',
    };
  });

  describe('alle inputs som vises', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsstedFly = shallow(<EnkeltArbeidsstedFly {...props} />);

      const inputs = enkeltArbeidsstedFly.find(Skjema.Input);
      const landvelgere = enkeltArbeidsstedFly.find(Skjema.LandVelger);
      const selects = enkeltArbeidsstedFly.find(Skjema.Select);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      landvelgere.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      selects.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
    });
  });
});
