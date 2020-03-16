import React from 'react';

import { VurderingArbeidsmonster } from './vurderingArbeidsmonster';


describe('VurderingVurderarbeidsland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilstand: {
        harAvklaring: true,
        marginaltArbeid: [],
        aktivitetINorge: {},
        aktivitetINorgeNodvendig: true,
        yrkesaktivitet: '',
        erYrkesaktivitetAntallLandNodvendig: true,
        loennetArbeidAntallLandFakta: {},
        landMedVesentligArbeid: [],
        erNorgeValgt: true,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      arbeidsland: [],
    };
  });

  it('viser Arbeidsmønstersteg uten å krasje', () => {
    shallow(<VurderingArbeidsmonster {...props} />);
  });
});
