import React from 'react';

import * as Skjema from '../../../skjema';

import EnkeltArbeidsstedLand from './enkeltArbeidsstedLand';

describe('EnkeltArbeidssted', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: 'foretakUtland[0]',
    };
  });

  describe('alle inputs som vises', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsstedLand = shallow(<EnkeltArbeidsstedLand {...props} />);

      const inputs = enkeltArbeidsstedLand.find(Skjema.Input);
      const landvelger = enkeltArbeidsstedLand.find(Skjema.LandVelger);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      expect(landvelger.props().disabled).toBe(!props.redigerbart);
    });
  });
});
