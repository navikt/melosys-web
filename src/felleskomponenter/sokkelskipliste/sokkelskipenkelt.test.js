import React from 'react';

import SokkelSkipEnkelt from './sokkelskipenkelt';

describe('SokkelSkipEnkelt', () => {
  let props = null;

  beforeEach(() => {
    props = {
      maritimtArbeid: {
        enhetNavn: 'Dunfjæder',
        fartsomradeKode: 'INNENRIKS',
        flaggLandkode: 'GB',
        installasjonsLandkode: 'GB',
        territorialfarvann: 'GB',
        foretakNavn: 'SWECO NORGE AS',
        foretakOrgnr: '96703227',
      },
      sokkelEllerSkip: {
        avklartefaktaKode: 'SOKKEL_ELLER_SKIP',
        referanse: 'SOKKEL_ELLER_SKIP',
        fakta: ['SKIP'],
        subjektID: 'Dunfjæder',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      arbeidslandAvklartfakta: {
        avklartefaktaKode: 'ARBEIDSLAND',
        referanse: 'INSTALLASJON_ARBEIDSLAND',
        fakta: ['GB'],
        subjektID: 'Dunfjæder',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      arbeidslandTypeAvklartfakta: {
        avklartefaktaKode: null,
        referanse: 'INSTALLASJON_ARBEIDSLAND_TYPE',
        fakta: [
          'Flaggland',
        ],
        subjektID: 'Dunfjæder',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      index: 1,
      begrunnelser: [],
      redigerbart: true,
      avklartefaktaEndretHandler: jest.fn(),
      avklartefaktaBegrunnelserEndretHandler: jest.fn(),
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
    };
  });

  it('vises uten å krasje', () => {
    shallow(<SokkelSkipEnkelt {...props} />);
  });
});
