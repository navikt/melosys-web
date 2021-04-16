import * as selectors from "./selectors";
import * as KV from "../../kodeverk";
import * as DucksTestUtils from "../test-utils";

describe("FormSelectors", () => {
  describe("SoknadErrorsSelector", () => {
    it("foretrekker å returnere verdier fra syncErrors", () => {
      const state = DucksTestUtils.lagState({
        form: {
          [KV.Form.SOKNAD]: {
            values: {
              oppgittAdresseRegion: "Oslo",
              oppgittAdresseHusnummer: "1234",
              oppgittAdressePoststed: "Oslo",
              oppgittAdresseLand: "NO",
              oppgittAdresseGatenavn: null,
              oppgittAdressePostnummer: null,
              selvstendigNaeringsvirksomhetUtland: [
                {
                  navn: "NAV",
                  orgnr: "012345678901234567890123456789",
                },
                {
                  navn: "NAV Oslo",
                  orgnr: "12341234123412341234123412341234",
                },
              ],
            },
            syncErrors: {
              oppgittAdresseGatenavn: {
                melding: "Feilmelding som overskriver en annen",
                panel: KV.Menypunkter.Person.tittel,
                undertittel: KV.Menypunkter.Person.undertitler.annenAdresse,
              },
              selvstendigNaeringsvirksomhetUtland: [
                {
                  navn: {
                    melding: "En annen feilmelding som overskriver",
                    panel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
                    undertittel:
                      KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
                  },
                },
              ],
            },
          },
        },
      });

      const forventetResultat = {
        oppgittAdresseGatenavn: {
          melding: "Feilmelding som overskriver en annen",
          panel: KV.Menypunkter.Person.tittel,
          undertittel: KV.Menypunkter.Person.undertitler.annenAdresse,
        },
        oppgittAdressePostnummer: {
          melding: "Postnummer kreves",
          panel: KV.Menypunkter.Person.tittel,
          undertittel: KV.Menypunkter.Person.undertitler.annenAdresse,
        },
        selvstendigNaeringsvirksomhetUtland: [
          {
            orgnr: {
              melding: "Registreringsnummer kan ikke være lenger enn 25 tegn",
              panel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              undertittel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
            },
            navn: {
              melding: "En annen feilmelding som overskriver",
              panel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              undertittel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
            },
          },
          {
            orgnr: {
              melding: "Registreringsnummer kan ikke være lenger enn 25 tegn",
              panel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
              undertittel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
            },
          },
        ],
      };

      expect(selectors.SoknadErrorsSelector(state)).toEqual(forventetResultat);
    });
  });

  describe("PanelFeilSelector", () => {
    it("returnerer errors gruppert per panel", () => {
      const { resultFunc } = selectors.PanelFeilSelector;

      const errors = {
        selvstendigNaeringsvirksomhetUtland: [
          {
            orgnr: {
              panel: "Arbeidsgiver/virksomhet",
              undertittel: "Selvstendig virksomhet i utlandet",
              melding: "Registreringsnummer kan ikke være lenger enn 25 tegn",
            },
            navn: {
              panel: "Arbeidsgiver/virksomhet",
              undertittel: "Selvstendig virksomhet i utlandet",
              melding: "Navn må oppgis",
            },
          },
          {
            orgnr: {
              panel: "Arbeidsgiver/virksomhet",
              undertittel: "Selvstendig virksomhet i utlandet",
              melding: "Registreringsnummer kan ikke være lenger enn 25 tegn",
            },
          },
        ],
        oppgittAdresseGatenavn: {
          panel: "Personopplysninger",
          undertittel: "Annen adresse",
          melding: "Gatenavn kreves",
        },
        oppgittAdressePostnummer: {
          panel: "Personopplysninger",
          undertittel: "Annen adresse",
          melding: "Postnummer kreves",
        },
      };

      const expectedResult = [
        {
          panel: KV.Menypunkter.ArbeidsgiverOgVirksomhet.tittel,
          feil: [
            `${KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet} - Registreringsnummer kan ikke være lenger enn 25 tegn`,
            `${KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet} - Navn må oppgis`,
            `${KV.Menypunkter.ArbeidsgiverOgVirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet} - Registreringsnummer kan ikke være lenger enn 25 tegn`,
          ],
        },
        {
          panel: KV.Menypunkter.Person.tittel,
          feil: [
            `${KV.Menypunkter.Person.undertitler.annenAdresse} - Gatenavn kreves`,
            `${KV.Menypunkter.Person.undertitler.annenAdresse} - Postnummer kreves`,
          ],
        },
      ];

      expect(resultFunc(errors)).toStrictEqual(expectedResult);
    });
  });
});
