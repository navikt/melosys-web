import { describe, it, expect } from "vitest";
import { RootState } from "AppTypes";
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
              oppgittAdresseHusnummerEtasjeLeilighet: "1234",
              oppgittAdressePoststed: "Oslo",
              oppgittAdresseLand: "NO",
              oppgittAdresseGatenavn: null,
              oppgittAdressePostnummer: null,
              oppgittAdresseTilleggsnavn: "tilleggsnavn",
              oppgittAdressePostboks: "Postboks oslo",
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
              soknadsperiodeFom: "01.01.2010",
              soknadsperiodeTom: "10.01.2020",
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
        foedestedOgLand: {
          foedested: {
            melding: "Fødested kreves",
            panel: KV.Menypunkter.Person.tittel,
            undertittel: KV.Menypunkter.Person.undertitler.foedestedOgLand,
          },
          foedeland: {
            melding: "Fødeland kreves",
            panel: KV.Menypunkter.Person.tittel,
            undertittel: KV.Menypunkter.Person.undertitler.foedestedOgLand,
          },
        },
      };
      expect(selectors.SoknadErrorsSelector(state as RootState)).toEqual(forventetResultat);
    });
  });
});
