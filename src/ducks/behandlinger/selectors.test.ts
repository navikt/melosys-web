import { describe, it, expect } from "vitest";
import { RootState } from "AppTypes";
import * as selectors from "./selectors";
import MKV from "../../melosyskodeverk";

interface MockState {
  lovvalgsperiode?: any;
  soknadsperiode?: any;
  behandlingstema?: string;
  sakstype?: string;
}

describe("Behandlingerselectors", () => {
  const lagState = ({ lovvalgsperiode, soknadsperiode, behandlingstema, sakstype }: MockState): Partial<RootState> => ({
    mottatteOpplysninger: {
      data: {
        data: {
          periode: soknadsperiode,
        },
      },
    },
    behandlinger: {
      data: {
        oppsummering: {
          behandlingstema: {
            kode: behandlingstema,
          },
        },
        saksopplysninger: {
          arbeidsforhold: [
            {
              arbeidsgiverID: "12345",
              opplysningspliktigID: "12345",
            },
          ],
          organisasjoner: [
            {
              orgnr: "12345",
              navn: "Organisasjon",
            },
          ],
          sed: {
            lovvalgsperiode,
          },
          inntekt: {
            arbeidsInntektMaanedListe: [
              {
                aarMaaned: "2019-10",
                arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: "12345", beloep: 30000 }] },
              },
              {
                aarMaaned: "2019-11",
                arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: "12345", beloep: 30000 }] },
              },
              {
                aarMaaned: "2019-12",
                arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: "12345", beloep: 30000 }] },
              },
              {
                aarMaaned: "2020-01",
                arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: "12345", beloep: 30000 }] },
              },
              {
                aarMaaned: "2020-02",
                arbeidsInntektInformasjon: { inntektListe: [{ opplysningspliktigID: "12345", beloep: 30000 }] },
              },
            ],
          },
        },
      },
    },
    lovvalgsperioder: {
      data: [],
    },
    fagsaker: {
      data: {
        sakstype: {
          kode: sakstype,
        },
      },
    },
    aarsavregning: {
      data: {},
    },
  });

  describe("ArbeidsgivereNorgeSelector", () => {
    it("returnerer tom liste dersom lovvalgsperiode og søknadsperiode ikke finnes", () => {
      const state = lagState({});
      expect(selectors.ArbeidsgivereNorgeSelector(state as RootState)).toEqual([]);
    });

    it("returnerer samme resultat så lenge lovvalgsperiode eller søknadsperiode er satt", () => {
      const data: [any, any][] = [
        [{ fom: "2020-02-02", tom: "2020-06-02" }, {}],
        [{}, { fom: "2020-02-02", tom: "2020-06-02" }],
        [
          { fom: "2020-02-02", tom: "2020-06-02" },
          { fom: "2020-02-02", tom: "2020-06-02" },
        ],
      ];

      data.forEach((el) => {
        const state = lagState({
          lovvalgsperiode: el[0],
          soknadsperiode: el[1],
        });
        const resultat = selectors.ArbeidsgivereNorgeSelector(state as RootState);

        expect(resultat).toHaveLength(1);
        const resultatet = resultat[0];

        expect(resultatet.arbeidsforholdene).toHaveLength(1);
        const arbeidsforholdet = resultatet.arbeidsforholdene[0];

        expect(arbeidsforholdet.arbeidsgiver).toEqual(resultatet.organisasjon);
        expect(resultatet.organisasjon.orgnr).toBe("12345");

        expect(resultatet.inntektListe.map((inntekt: any) => inntekt.aarMaaned)).toEqual(
          expect.arrayContaining(["2019-08", "2019-09", "2019-10", "2019-11", "2019-12", "2020-01", "2020-02"]),
        );

        expect(
          resultatet.inntektListe
            .filter((inntekt: any) => ["2019-08", "2019-09"].includes(inntekt.aarMaaned))
            .map((inntekt: any) => inntekt.beloep),
        ).toEqual(expect.arrayContaining([0, 0]));

        expect(
          resultatet.inntektListe
            .filter((inntekt: any) => !["2019-08", "2019-09"].includes(inntekt.aarMaaned))
            .map((inntekt: any) => inntekt.beloep),
        ).toEqual(expect.arrayContaining([30000, 30000, 30000, 30000, 30000, 30000]));
      });
    });
  });

  describe("ErAnmodningOmUnntakHovedRegelOgHarFlytSelector", () => {
    it("returnerer korrekte verdier for ulike behandlingstema og sakstyper", () => {
      const data: [boolean, string, string][] = [
        [true, MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL, MKV.Koder.sakstyper.EU_EOS],
        [true, MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL, MKV.Koder.sakstyper.FTRL],
        [
          false,
          MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
          MKV.Koder.sakstyper.TRYGDEAVTALE,
        ],
        [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG, MKV.Koder.sakstyper.EU_EOS],
        [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG, MKV.Koder.sakstyper.FTRL],
      ];
      data.forEach((el) => {
        const state = lagState({
          behandlingstema: el[1],
          sakstype: el[2],
        });

        expect(selectors.ErAnmodningOmUnntakHovedRegelOgHarFlytSelector(state as RootState)).toBe(el[0]);
      });
    });
  });

  describe("ErRegistreringUnntakNorskTrygdUtstasjoneringSelector", () => {
    it("returnerer korrekte verdier", () => {
      const data: [boolean, string][] = [
        [true, MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING],
        [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG],
      ];
      data.forEach((el) => {
        const state = lagState({
          behandlingstema: el[1],
        });

        expect(selectors.ErRegistreringUnntakNorskTrygdUtstasjoneringSelector(state as RootState)).toBe(el[0]);
      });
    });
  });

  describe("ErRegistreringUnntakNorskTrygdOvrigeSelector", () => {
    it("returnerer korrekte verdier", () => {
      const data: [boolean, string][] = [
        [true, MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE],
        [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG],
      ];
      data.forEach((el) => {
        const state = lagState({
          behandlingstema: el[1],
        });

        expect(selectors.ErRegistreringUnntakNorskTrygdOvrigeSelector(state as RootState)).toBe(el[0]);
      });
    });
  });

  describe("ErUtlMyndUtpektSegSelvSelector", () => {
    it("returnerer korrekte verdier", () => {
      const data: [boolean, string][] = [
        [true, MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND],
        [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG],
      ];
      data.forEach((el) => {
        const state = lagState({
          behandlingstema: el[1],
        });

        expect(selectors.ErUtlMyndUtpektSegSelvSelector(state as RootState)).toBe(el[0]);
      });
    });
  });
});
