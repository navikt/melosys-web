import React from 'react';

import { VurderingArtikkel13UtpekLand } from './vurderingArtikkel13UtpekLand';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_1_Vedtak', () => {
  it('vises uten å krasje', () => {
    const props = {
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
    };

    shallow(<VurderingArtikkel13UtpekLand {...props} />);
  });
});
