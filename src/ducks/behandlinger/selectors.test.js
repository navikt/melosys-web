import * as selectors from './selectors';

describe('Behandlingerselectors', () => {
  const lagState = (lovvalgsperiode, soknadsperiode) => ({
    behandlingsgrunnlag: {
      data: {
        data: {
          periode: soknadsperiode,
        },
      },
    },
    behandlinger: {
      data: {
        saksopplysninger: {
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
            lovvalgsperiode,
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
        },
      },
    },
    lovvalgsperioder: {
      data: [],
    },
  });
  describe('ArbeidsgivereNorgeSelector', () => {
    it('returnerer tom liste dersom lovvalgsperiode og søknadsperiode ikke finnes', () => {
      const state = lagState({}, {});
      expect(selectors.ArbeidsgivereNorgeSelector(state)).toEqual([]);
    });

    each([
      [{ fom: '2020-02-02', tom: '2020-06-02' }, {}],
      [{}, { fom: '2020-02-02', tom: '2020-06-02' }],
      [{ fom: '2020-02-02', tom: '2020-06-02' }, { fom: '2020-02-02', tom: '2020-06-02' }],
    ]).it('returnerer samme resultat så lenge lovvalgsperiode eller søknadsperiode er satt', (lovvalgsperiode, soknadsperiode) => {
      const state = lagState(lovvalgsperiode, soknadsperiode);
      const resultat = selectors.ArbeidsgivereNorgeSelector(state);

      expect(resultat).toHaveLength(1);
      const resultatet = resultat[0];

      expect(resultatet.arbeidsforholdene).toHaveLength(1);
      const arbeidsforholdet = resultatet.arbeidsforholdene[0];

      expect(arbeidsforholdet.arbeidsgiver).toEqual(resultatet.organisasjon);
      expect(resultatet.organisasjon.orgnr).toBe('12345');

      expect(resultatet.inntektListe.map(inntekt => inntekt.aarMaaned))
        .toEqual(expect.arrayContaining([
          '2019-08', '2019-09', '2019-10', '2019-11', '2019-12', '2020-01', '2020-02',
        ]));

      expect(resultatet.inntektListe
        .filter(inntekt => ['2019-08', '2019-09'].includes(inntekt.aarMaaned))
        .map(inntekt => inntekt.beloep))
        .toEqual(expect.arrayContaining([0, 0]));

      expect(resultatet.inntektListe
        .filter(inntekt => !['2019-08', '2019-09'].includes(inntekt.aarMaaned))
        .map(inntekt => inntekt.beloep))
        .toEqual(expect.arrayContaining([30000, 30000, 30000, 30000, 30000, 30000]));
    });
  });
});
