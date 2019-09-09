import React from 'react';

import { VurderingArtikkel13_1_Vedtak } from './vurderingArtikkel13_1_vedtak';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_1_Vedtak', () => {
  it('vises uten å krasje', () => {
    const props = {
      tilstand: {
        overskrift: 'Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a',
      },
      redigerbart: true,
      behandlingID: 4,
      lovvalgsperiode: {},
      endreLovvalgsPeriode: jest.fn(),
      lagreOgFatteVedtak: jest.fn(),
      formIsValid: true,
      formValues: {},
      touch: jest.fn(),
    };

    shallow(<VurderingArtikkel13_1_Vedtak {...props} />);
  });
});
