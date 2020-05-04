import * as selectors from './selectors';
import * as KV from '../../kodeverk';

import MKV from '../../melosyskodeverk';

describe('Avklartefaktaselectors', () => {
  const lagState = ({
    avklartefakta,
    behandlingstype,
    behandlingstema,
    behandlingsgrunnlagData,
    behandlingerSaksopplysninger,
  }) => ({
    avklartefakta: {
      data: avklartefakta,
    },
    behandlinger: {
      data: {
        oppsummering: {
          behandlingstype: {
            kode: behandlingstype,
          },
          behandlingstema: {
            kode: behandlingstema,
          },
        },
        saksopplysninger: behandlingerSaksopplysninger,
      },
    },
    behandlingsgrunnlag: {
      data: {
        data: behandlingsgrunnlagData,
      },
    },
    lovvalgsperioder: {
      data: [],
    },
    organisasjoner: [],
  });

  describe('ArbeidslandKTSelector', () => {
    it('returnerer ikke land som er SOKNADSLAND med fakta IKKE_ARBEIDSLAND', () => {
      const avklartefakta = [
        {
          referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
          fakta: [KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND],
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
      ];

      const behandlingstema = MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND;

      const behandlingsgrunnlagData = {
        arbeidNorge: {
          flyendePersonellHjemmebase: MKV.Koder.landkoder.FR,
        },
      };

      const forventetResultat = [KV.kodeTilObjekt(MKV.Koder.landkoder.FR, MKV.KTObjects.landkoder)];

      const state = lagState({
        avklartefakta,
        behandlingstema,
        behandlingsgrunnlagData,
      });
      expect(selectors.ArbeidslandKTSelector(state)).toEqual(forventetResultat);
    });

    each([
      [
        [KV.kodeTilObjekt(MKV.Koder.landkoder.GB, MKV.KTObjects.landkoder)],
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
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
        {
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
        },
      ],
      [
        [KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder)],
        [
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
            subjektID: MKV.Koder.landkoder.DE,
            fakta: ['TRUE'],
          },
        ],
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
        {
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
        },
      ],
    ]).it('returnerer korrekt verdi', (forventetResultat, avklartefakta, behandlingstema, behandlingsgrunnlagData) => {
      const state = lagState({
        avklartefakta,
        behandlingstema,
        behandlingsgrunnlagData,
      });
      expect(selectors.ArbeidslandKTSelector(state)).toEqual(forventetResultat);
    });
  });

  describe('ArbeidslandMedYrkesAktivitetSelector', () => {
    const behandlingstype = MKV.Koder.behandlinger.behandlingstyper.SOEKNAD;
    const lagSoknadslandFakta = land => ({
      referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
      subjektID: land,
      fakta: [KV.Koder.BoolskAvklartfaktaType.SANN],
    });

    each([
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder),
            erLonnetArbeid: true,
            erSelvstendigNaeringsvirksomhet: true,
          },
        ],
        {
          foretakUtland: [
            {
              selvstendigNaeringsvirksomhet: true,
              adresse: {
                landkode: MKV.Koder.landkoder.DE,
              },
            },
          ],
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
          arbeidUtland: [
            {
              adresse: {
                landkode: MKV.Koder.landkoder.DE,
              },
            },
          ],
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder),
            erLonnetArbeid: true,
            erSelvstendigNaeringsvirksomhet: false,
          },
        ],
        {
          foretakUtland: [
            {
              selvstendigNaeringsvirksomhet: false,
              adresse: {
                landkode: MKV.Koder.landkoder.DE,
              },
            },
          ],
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
          arbeidUtland: [],
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder),
            erLonnetArbeid: false,
            erSelvstendigNaeringsvirksomhet: false,
          },
        ],
        {
          foretakUtland: [],
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
          arbeidUtland: [],
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.DE, MKV.KTObjects.landkoder),
            erLonnetArbeid: false,
            erSelvstendigNaeringsvirksomhet: true,
          },
        ],
        {
          foretakUtland: [
            {
              selvstendigNaeringsvirksomhet: true,
              adresse: {
                landkode: MKV.Koder.landkoder.DE,
              },
            },
          ],
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.DE],
          },
          arbeidUtland: [],
        },
      ],
    ]).it('returnerer korrekt verdi for arbeidsland som ikke er Norge', (forventetResultat, behandlingsgrunnlagData) => {
      const arbeidsland = MKV.Koder.landkoder.DE;
      const avklartefakta = [lagSoknadslandFakta(arbeidsland)];
      const state = lagState({
        avklartefakta,
        behandlingstype,
        behandlingsgrunnlagData,
      });

      expect(selectors.ArbeidslandMedYrkesAktivitetSelector(state)).toEqual(forventetResultat);
    });

    each([
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.NO, MKV.KTObjects.landkoder),
            erLonnetArbeid: false,
            erSelvstendigNaeringsvirksomhet: false,
          },
        ],
        {
          selvstendigArbeid: {
            erSelvstendig: false,
          },
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.NO],
          },
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.NO, MKV.KTObjects.landkoder),
            erLonnetArbeid: false,
            erSelvstendigNaeringsvirksomhet: true,
          },
        ],
        {
          selvstendigArbeid: {
            erSelvstendig: true,
            selvstendigForetak: [
              {},
            ],
          },
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.NO],
          },
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.NO, MKV.KTObjects.landkoder),
            erLonnetArbeid: true,
            erSelvstendigNaeringsvirksomhet: false,
          },
        ],
        {
          selvstendigArbeid: {
            erSelvstendig: false,
          },
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.NO],
          },
          periode: { fom: '2020-02-02', tom: '2020-06-02' },
        },
      ],
      [
        [
          {
            land: KV.kodeTilObjekt(MKV.Koder.landkoder.NO, MKV.KTObjects.landkoder),
            erLonnetArbeid: true,
            erSelvstendigNaeringsvirksomhet: true,
          },
        ],
        {
          selvstendigArbeid: {
            erSelvstendig: true,
            selvstendigForetak: [
              {},
            ],
          },
          soeknadsland: {
            landkoder: [MKV.Koder.landkoder.NO],
          },
          periode: { fom: '2020-02-02', tom: '2020-06-02' },
        },
      ],
    ]).it('returner korrekt verdi for arbeidsland lik Norge', (forventetResultat, behandlingsgrunnlagData) => {
      const arbeidsland = MKV.Koder.landkoder.NO;
      const avklartefakta = [lagSoknadslandFakta(arbeidsland)];
      const behandlingerSaksopplysninger = {
        arbeidsforhold: [
          {
            arbeidsgiverID: '12345',
            opplysningspliktigID: '12345',
          },
        ],
        organisasjoner: [
          {
            orgnr: '12345',
            navn: 'Organisasjon',
          },
        ],
        sed: {
          fom: '2020-02-02',
          tom: '2020-06-02',
        },
        inntekt: {
          arbeidsInntektMaanedListe: [
            {
              aarMaaned: '2019-10',
              arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: '12345', beloep: 30000 }] },
            },
            {
              aarMaaned: '2019-11',
              arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: '12345', beloep: 30000 }] },
            },
            {
              aarMaaned: '2019-12',
              arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: '12345', beloep: 30000 }] },
            },
            {
              aarMaaned: '2020-01',
              arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: '12345', beloep: 30000 }] },
            },
            {
              aarMaaned: '2020-02',
              arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: '12345', beloep: 30000 }] },
            },
          ],
        },
      };

      const state = lagState({
        avklartefakta,
        behandlingstype,
        behandlingsgrunnlagData,
        behandlingerSaksopplysninger,
      });

      expect(selectors.ArbeidslandMedYrkesAktivitetSelector(state)).toEqual(forventetResultat);
    });
  });

  describe('ErIArtikkel13_1FlytSelector', () => {
    each([
      [
        true,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      ],
      [
        false,
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
      ],
    ]).it('returnerer korrekt verdi', (forventetResultat, behandlingstema) => {
      const state = lagState({
        behandlingstema,
      });

      expect(selectors.ErIArtikkel13_1FlytSelector(state)).toEqual(forventetResultat);
    });
  });

  describe('LoennetArbeidUtlandSelector', () => {
    it('returnerer land med utenlandsk lønnet arbeid', () => {
      const id = '1';

      const avklartefakta = [
        {
          referanse: MKV.Koder.avklartefaktatyper.VIRKSOMHET,
          subjektID: id,
          fakta: [KV.Koder.BoolskAvklartfaktaType.SANN],
        },
      ];

      const behandlingsgrunnlagData = {
        foretakUtland: [
          {
            uuid: id,
            navn: 'navn',
            adresse: {
              landkode: MKV.Koder.landkoder.DE,
            },
          },
        ],
      };

      const forventetResultat = [MKV.Koder.landkoder.DE];

      const state = lagState({
        avklartefakta,
        behandlingsgrunnlagData,
      });

      expect(selectors.LoennetArbeidUtlandSelector(state)).toEqual(forventetResultat);
    });
  });
});
