import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

import EnkeltArbeidsforhold from './enkeltArbeidsforhold';

describe('EnkeltArbeidsforhold', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      slett: jest.fn(),
      index: 0,
      overordnetFeltnavn: 'feltnavn',
      className: 'cssklasse',
      slettTekst: 'slett',
    };
  });

  describe('alle inputs som vises', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsforhold = shallow(<EnkeltArbeidsforhold {...props} />);
      const inputs = enkeltArbeidsforhold.find(Nav.Input);
      const landvelger = enkeltArbeidsforhold.find(Skjema.LandVelger);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
      expect(landvelger.props().disabled).toBe(!props.redigerbart);
    });
  });

  describe('lenke for sletting', () => {
    it('vises', () => {
      const enkeltArbeidsforhold = shallow(<EnkeltArbeidsforhold {...props} />);
      const lenke = enkeltArbeidsforhold.find(Nav.Lenker);

      expect(lenke).toHaveLength(1);
    });

    it('kaller slett med index som argument ved klikk', () => {
      const enkeltArbeidsforhold = shallow(<EnkeltArbeidsforhold {...props} />);
      const lenke = enkeltArbeidsforhold.find(Nav.Lenker);

      lenke.simulate('click');

      expect(props.slett).toHaveBeenCalledTimes(1);
      expect(props.slett).toHaveBeenLastCalledWith(props.index);
    });

    it('vises ikke dersom ikke redigerbart', () => {
      props.redigerbart = false;
      const enkeltArbeidsforhold = shallow(<EnkeltArbeidsforhold {...props} />);
      const slettLenke = enkeltArbeidsforhold.find(Nav.Lenker);

      expect(slettLenke).toHaveLength(0);
    });
  });
});
