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
    utpekingsperioder,
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
    utpekingsperioder: {
      data: utpekingsperioder,
    },
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
        luftfartBaser: [],
      };

      const forventetResultat = [];

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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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
          luftfartBaser: [],
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

  describe('AvklarteVirksomheterIkkeNaeringsdrivendeSelector', () => {
    const { resultFunc } = selectors.AvklarteVirksomheterIkkeNaeringsdrivendeSelector;

    it('throw error hvis avklart virksomhet ikke tilhører foretak eller organisasjon', () => {
      const alleAvklarteVirksomhetFaktaer = [
        {
          subjektID: '1',
        },
      ];
      const fagsakOrganisasjoner = [];
      const soknadOrganisasjoner = [];
      const foretakUtland = [];
      const selvstendigArbeidForetak = [];

      expect(() => {
        resultFunc(alleAvklarteVirksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland, selvstendigArbeidForetak);
      }).toThrow();
    });

    it('selvstendige foretakUtland returneres ikke', () => {
      const alleAvklarteVirksomhetFaktaer = [
        {
          subjektID: '1',
        },
      ];
      const fagsakOrganisasjoner = [];
      const soknadOrganisasjoner = [];
      const foretakUtland = [
        {
          uuid: '1',
          selvstendigNaeringsvirksomhet: true,
        },
      ];
      const selvstendigArbeidForetak = [];

      const forventetResultat = [];

      expect(resultFunc(alleAvklarteVirksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland, selvstendigArbeidForetak)).toEqual(forventetResultat);
    });

    it('ikke-selvstendige foretakUtland returneres', () => {
      const alleAvklarteVirksomhetFaktaer = [
        {
          subjektID: '1',
        },
      ];
      const fagsakOrganisasjoner = [];
      const soknadOrganisasjoner = [];
      const foretakUtland = [
        {
          uuid: '1',
          selvstendigNaeringsvirksomhet: false,
          adresse: {},
        },
      ];
      const selvstendigArbeidForetak = [];

      const resultat = resultFunc(alleAvklarteVirksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland, selvstendigArbeidForetak);

      expect(resultat[0].virksomhetId).toBe('1');
    });

    it('selvstendige arbeid foretak returneres ikke', () => {
      const alleAvklarteVirksomhetFaktaer = [
        {
          subjektID: '1',
        },
      ];
      const fagsakOrganisasjoner = [];
      const soknadOrganisasjoner = [
        {
          orgnr: '1',
        },
      ];
      const foretakUtland = [];
      const selvstendigArbeidForetak = [
        {
          orgnr: '1',
        },
      ];

      const forventetResultat = [];

      expect(resultFunc(alleAvklarteVirksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland, selvstendigArbeidForetak)).toEqual(forventetResultat);
    });

    it('virksomheter som finnes blant organisasjoner returneres', () => {
      const alleAvklarteVirksomhetFaktaer = [
        {
          subjektID: '1',
        },
        {
          subjektID: '2',
        },
      ];
      const fagsakOrganisasjoner = [
        {
          orgnr: '2',
          forretningsadresse: {},
        },
      ];
      const soknadOrganisasjoner = [
        {
          orgnr: '1',
          forretningsadresse: {},
        },
      ];
      const foretakUtland = [];
      const selvstendigArbeidForetak = [];

      const forventetResultat = [
        {
          virksomhetId: '1',
        },
        {
          virksomhetId: '2',
        },
      ];

      expect(resultFunc(alleAvklarteVirksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland, selvstendigArbeidForetak)).toMatchObject(forventetResultat);
    });
  });

  describe('LandSomKreverSEDKTSelector', () => {
    const avklartefaktaArbeidslandMedMarginaltArbeid = [
      {
        avklartefaktaKode: 'MARGINALT_ARBEID',
        referanse: 'MARGINALT_ARBEID',
        fakta: [
          'TRUE',
        ],
        subjektID: 'DK',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: 'MARGINALT_ARBEID',
        referanse: 'MARGINALT_ARBEID',
        fakta: [
          'TRUE',
        ],
        subjektID: 'NO',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: 'ARBEIDSLAND',
        referanse: 'ARBEIDSLAND',
        fakta: [
          'DK',
        ],
        subjektID: 'DK',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: 'ARBEIDSLAND',
        referanse: 'ARBEIDSLAND',
        fakta: [
          'NO',
        ],
        subjektID: 'NO',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
    ];

    const avklartefaktaArbeidslandUtenMarginaltArbeid = [
      {
        avklartefaktaKode: null,
        referanse: 'SOKNADSLAND',
        fakta: [
          'TRUE',
        ],
        subjektID: 'DK',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: null,
        referanse: 'SOKNADSLAND',
        fakta: [
          'TRUE',
        ],
        subjektID: 'NO',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: 'ARBEIDSLAND',
        referanse: 'ARBEIDSLAND',
        fakta: [
          'DK',
        ],
        subjektID: 'DK',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
      {
        avklartefaktaKode: 'ARBEIDSLAND',
        referanse: 'ARBEIDSLAND',
        fakta: [
          'NO',
        ],
        subjektID: 'NO',
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      },
    ];

    const soeknadsland = {
      landkoder: [
        'DK',
        'NO',
      ],
    };

    const foretakUtland = [
      {
        adresse: {
          landkode: 'DK',
        },
      },
    ];

    const lagStateDefaults = ({
      avklartefakta,
      behandlingsgrunnlagData,
      utpekingsperioder,
    }) => lagState({
      avklartefakta: avklartefakta || [],
      behandlingsgrunnlagData: behandlingsgrunnlagData || [],
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      utpekingsperioder: utpekingsperioder || [],
    });

    it('skal returnere tom liste når ingen land er oppgitt', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({}));
      expect(resultat.length).toBe(0);
    });

    it('skal returnere tom liste når alle arbeidsland har marginalt arbeid', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        avklartefakta: avklartefaktaArbeidslandMedMarginaltArbeid,
        behandlingsgrunnlagData: {
          soeknadsland,
        },
      }));
      expect(resultat.length).toBe(0);
    });

    it('skal returnere arbeidsland uten marginalt arbeid', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        avklartefakta: avklartefaktaArbeidslandUtenMarginaltArbeid,
        behandlingsgrunnlagData: {
          soeknadsland,
        },
      }));
      expect(resultat.length).toBe(2);

      const landkoder = resultat.map(({ kode }) => kode);
      expect(landkoder).toEqual(expect.arrayContaining(['DK', 'NO']));
    });

    it('skal returnere arbeidsland med marginalt arbeid som er oppgitt i foretakUtland', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        avklartefakta: avklartefaktaArbeidslandMedMarginaltArbeid,
        behandlingsgrunnlagData: {
          soeknadsland,
          foretakUtland,
        },
      }));
      expect(resultat.length).toBe(1);

      const landkoder = resultat.map(({ kode }) => kode);
      expect(landkoder).toEqual(expect.arrayContaining(['DK']));
    });

    it('skal returnere arbeidsland med marginalt arbeid som er oppgitt i arbeidUtland', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        avklartefakta: avklartefaktaArbeidslandMedMarginaltArbeid,
        behandlingsgrunnlagData: {
          soeknadsland,
          arbeidUtland: foretakUtland,
        },
      }));
      expect(resultat.length).toBe(1);

      const landkoder = resultat.map(({ kode }) => kode);
      expect(landkoder).toEqual(expect.arrayContaining(['DK']));
    });

    it('skal returnere lovvalgsland oppgitt i utpekingsperiode', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        utpekingsperioder: [
          {
            lovvalgsland: 'DE',
          },
        ],
      }));
      expect(resultat.length).toBe(1);

      const landkoder = resultat.map(({ kode }) => kode);
      expect(landkoder).toEqual(expect.arrayContaining(['DE']));
    });

    it('skal ikke returnere flere av samme land', () => {
      const resultat = selectors.LandSomKreverSEDKTSelector(lagStateDefaults({
        avklartefakta: avklartefaktaArbeidslandUtenMarginaltArbeid,
        behandlingsgrunnlagData: {
          soeknadsland,
          foretakUtland,
          arbeidUtland: foretakUtland,
        },
      }));
      expect(resultat.length).toBe(2);

      const landkoder = resultat.map(({ kode }) => kode);
      expect(landkoder).toEqual(expect.arrayContaining(['DK', 'NO']));
    });
  });
});
