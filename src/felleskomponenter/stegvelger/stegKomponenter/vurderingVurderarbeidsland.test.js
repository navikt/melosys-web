import React from 'react';

import * as Mui from '../../ui';

import MKV from '../../../melosyskodeverk';

import { VurderingVurderarbeidsland } from './vurderingVurderarbeidsland';
import SokkelSkipListe from '../../../felleskomponenter/sokkelskipliste';


describe('VurderingVurderarbeidsland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilstand: {
        harAvklaring: true,
        sokkelEllerSkipListe: [],
        installasjonArbeidslandListe: [],
        installasjonArbeidslandTypeListe: [],
        arbeidslandListe: [],
        arbeidUtforesIOppgittLandFakta: undefined,
        fjernetArbeidslandFakta: [],
        harIngenMaritimeArbeidEllerHjemmebase: false,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      maritimtArbeid: [{
        enhetNavn: 'Dunfjæder',
        fartsomradeKode: 'INNENRIKS',
        flaggLandkode: 'GB',
        installasjonsLandkode: 'GB',
        territorialfarvann: 'GB',
        foretakNavn: 'SWECO NORGE AS',
        foretakOrgnr: '967032271',
      }],
      hjemmebase: MKV.Koder.landkoder.DE,
      soknadsland: [],
      arbeidsland: [],
      fjernedeArbeidsland: [],
      fjernedeSoknadsland: [],
    };
  });

  it('viser en Sokkelskipliste', () => {
    const vurderingVurderarbeidsland = shallow(<VurderingVurderarbeidsland {...props} />);

    expect(vurderingVurderarbeidsland.find(SokkelSkipListe)).toHaveLength(1);
  });

  it('viser to RedigerbarListe', () => {
    const vurderingVurderarbeidsland = shallow(<VurderingVurderarbeidsland {...props} />);

    expect(vurderingVurderarbeidsland.find(Mui.RedigerbarListe)).toHaveLength(2);
  });
});
