import React from 'react';
import * as MKV from 'melosys-kodeverk';

import { VurderingArtikkel13_1b_UtpekLand } from './vurderingArtikkel13_1b_UtpekLand';

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
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
      form: 'Form',
    };

    shallow(<VurderingArtikkel13_1b_UtpekLand {...props} />);
  });
});
