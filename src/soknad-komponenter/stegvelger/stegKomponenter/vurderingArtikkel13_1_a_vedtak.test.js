import React from 'react';

import { VurderingArtikkel13_1_A_Vedtak } from './vurderingArtikkel13_1_a_vedtak';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_1_A_Vedtak', () => {
  it('vises uten å krasje', () => {
    const props = {
      redigerbart: true,
      behandlingID: 4,
      lovvalgsperiode: {},
      endreDatoOgSendLovvalgsperioder: jest.fn(),
      lagreOgFatteVedtak: jest.fn(),
      formIsValid: true,
      formValues: {},
      touch: jest.fn(),
    };

    shallow(<VurderingArtikkel13_1_A_Vedtak {...props} />);
  });
});
