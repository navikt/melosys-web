import * as selectors from './selectors';
import * as KV from '../../kodeverk';

import MKV from '../../melosyskodeverk';

describe('Avklartefaktaselectors', () => {
  const lagState = (avklartefakta, behandlingstype, behandlingsgrunnlagData) => ({
    avklartefakta: {
      data: avklartefakta,
    },
    behandlinger: {
      data: {
        oppsummering: {
          behandlingstype: {
            kode: behandlingstype,
          },
        },
      },
    },
    behandlingsgrunnlag: {
      data: {
        data: behandlingsgrunnlagData,
      },
    },
  });

  describe('ArbeidslandKTSelector', () => {
    each([
      [
        [MKV.KTObjects.landkoder.find(({ kode }) => kode === MKV.Koder.landkoder.FR)],
        [
          {
            referanse: KV.Koder.avklartefaktaKoder.FJERNET_ARBEIDSLAND,
            subjektID: MKV.Koder.landkoder.DK,
          },
          {
            referanse: KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND,
            fakta: [MKV.Koder.landkoder.DK],
          },
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP,
            fakta: [],
          },
        ],
        MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_FLERE_LAND,
        {
          arbeidNorge: {
            flyendePersonellHjemmebase: MKV.Koder.landkoder.FR,
          },
        },
      ],
      [
        [MKV.KTObjects.landkoder.find(({ kode }) => kode === MKV.Koder.landkoder.GB)],
        [
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
            subjektID: MKV.Koder.landkoder.DE,
            fakta: ['TRUE'],
          },
          {
            referanse: KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND,
            fakta: [MKV.Koder.landkoder.GB],
          },
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP,
            fakta: [],
          },
        ],
        MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
        {
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
        },
      ],
      [
        [MKV.KTObjects.landkoder.find(({ kode }) => kode === MKV.Koder.landkoder.DE)],
        [
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
            subjektID: MKV.Koder.landkoder.DE,
            fakta: ['TRUE'],
          },
        ],
        MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
        {
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
        },
      ],
    ]).test('returnerer korrekt verdi', (forventetResultat, avklartefakta, behandlingstype, behandlingsgrunnlagData) => {
      const state = lagState(avklartefakta, behandlingstype, behandlingsgrunnlagData);
      expect(selectors.ArbeidslandKTSelector(state)).toEqual(forventetResultat);
    });
  });
});
