import React from 'react';

import MKV from '../../../../../melosyskodeverk';

import VurderingArtikkel13_2b from './vurderingArtikkel13_2b';
import EnkeltLandPure from '../../../../../felleskomponenter/skjema/landvelger/enkeltLandPure';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_2b', () => {
  let props = null;

  beforeEach(() => {
    props = {
      tilstand: {
        omfattesILandFakta: {
          fakta: [MKV.Koder.landkoder.CY],
        },
        harAvklaring: true,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      bekreftOgFortsett: jest.fn(),
    };
  });

  it('vises uten å krasje', () => {
    shallow(<VurderingArtikkel13_2b {...props} />);
  });

  it('viser landvelger dersom Norge ikke er valgt', () => {
    const vurderingArtikkel13_2b = shallow(<VurderingArtikkel13_2b {...props} />);

    expect(vurderingArtikkel13_2b.find(EnkeltLandPure)).toHaveLength(1);
  });

  it('viser ikke landvelger dersom Norge er valgt', () => {
    props.tilstand.omfattesILandFakta.fakta = [MKV.Koder.landkoder.NO];
    const vurderingArtikkel13_2b = shallow(<VurderingArtikkel13_2b {...props} />);

    expect(vurderingArtikkel13_2b.find(EnkeltLandPure)).toHaveLength(0);
  });
});
