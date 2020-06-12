import React from 'react';

import * as Skjema from '../../skjema';

import { VurderingArtikkel13UtpekLand } from './vurderingArtikkel13UtpekLand';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_1_UtpekLand', () => {
  let props = null;

  beforeEach(() => {
    props = {
      tilstand: {
        overskrift: 'Omfattet av norsk lovgivning, etter artikkel 13, nr 1, b',
      },
      redigerbart: true,
      behandlingID: 3,
      lovvalgsland: 'NO',
      lagreOgUtpek: jest.fn(),
      formIsValid: true,
      formValues: {},
      touch: jest.fn(),
      form: 'Form',
      touchAll: jest.fn(),
      erOffentligArbeidUtland: true,
      harLonnetArbeidAnnetLand: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      lagreUtpekingsperioder: jest.fn(),
      ikkeMarginaleArbeidsland: [],
      oppdaterMottakerinstitusjoner: jest.fn(),
    };
  });

  it('viser fritekst for orienteringsbrev', () => {
    const vurderingArt13UtpekLand = shallow(<VurderingArtikkel13UtpekLand {...props} />);

    const fritekstOrienteringsbrevTextarea = vurderingArt13UtpekLand.findWhere(n =>
      n.type() === Skjema.Textarea &&
      n.props().label === 'Fritekst til orienteringsbrev');

    expect(fritekstOrienteringsbrevTextarea).toHaveLength(1);
    expect(fritekstOrienteringsbrevTextarea.props().disabled).toBe(false);
  });
});
