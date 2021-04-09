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
            },
            syncErrors: {
              oppgittAdresseGatenavn: { melding: "Feilmelding som overskriver en annen" },
            },
          },
        },
      });

      const forventetResultat = {
        oppgittAdresseGatenavn: { melding: "Feilmelding som overskriver en annen" },
        oppgittAdressePostnummer: {
          melding: "Postnummer kreves",
          panel: KV.Menypunkter.Person.tittel,
          undertittel: KV.Menypunkter.Person.undertitler.annenAdresse,
        },
      };

      expect(selectors.SoknadErrorsSelector(state)).toEqual(forventetResultat);
    });
  });
});
