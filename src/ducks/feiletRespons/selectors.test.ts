import { RootState } from "AppTypes";

import * as selectors from "./selectors";

import MKV from "../../melosyskodeverk";

import { STATUS } from "../../services";

describe("FeiletresponsSelectors", () => {
  describe("FeilkoderSelector", () => {
    it("returnerer feilkoder ved status ERROR", () => {
      const state = {
        feiletRespons: {
          data: {
            data: {
              feilkoder: [],
              error: "Valideringsfeil",
              status: 404,
              message: "Valideringsfeil",
            },
          },
          status: STATUS.ERROR,
        },
      } as RootState;

      const forventetResultat = state.feiletRespons.data.data && state.feiletRespons.data.data.feilkoder;

      expect(selectors.FeilmeldingerSelector(state)).toBe(forventetResultat);
    });

    it("returnerer tom array ved status OK", () => {
      const state = {
        feiletRespons: {
          data: {
            data: {
              feilkoder: [
                {
                  kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
                  felter: [],
                },
                {
                  kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
                  felter: [],
                },
              ],
              error: "Valideringsfeil",
              status: 404,
              message: "Valideringsfeil",
            },
          },
          status: STATUS.OK,
        },
      } as RootState;

      expect(selectors.FeilmeldingerSelector(state)).toEqual([]);
    });

    it("returnerer string med error message ved feilkoder undefined", () => {
      const MESSAGE = "Kan ikke fatte vedtak";
      const state = {
        feiletRespons: {
          data: {
            data: {
              error: "Valideringsfeil",
              status: 404,
              message: MESSAGE,
            },
          },
          status: STATUS.ERROR,
        },
      } as RootState;

      expect(selectors.FeilmeldingerSelector(state)).toEqual(MESSAGE);
    });

    it("returnerer tom array ved data undefined", () => {
      const state = {
        feiletRespons: {
          data: {},
          status: STATUS.ERROR,
        },
      } as RootState;

      expect(selectors.FeilmeldingerSelector(state)).toEqual([]);
    });
  });
});
