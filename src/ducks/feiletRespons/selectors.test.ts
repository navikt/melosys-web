import { mock, instance } from "ts-mockito";
import { RootState } from "AppTypes";

import * as selectors from "./selectors";

import MKV from "../../melosyskodeverk";

import { STATUS } from "../../services";

describe("FeiletresponsSelectors", () => {
  describe("FeilkoderSelector", () => {
    it("returnerer feilkoder ved status ERROR", () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.feiletRespons = {
        data: {
          data: {
            feilkoder: [],
            error: "Valideringsfeil",
            status: 404,
            message: "Valideringsfeil",
          },
        },
        status: STATUS.ERROR,
      };

      const forventetResultat = state.feiletRespons.data.data && state.feiletRespons.data.data.feilkoder;

      expect(selectors.FeilkoderSelector(state)).toBe(forventetResultat);
    });

    it("returnerer tom array ved status OK", () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.feiletRespons = {
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
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it("returnerer tom array ved feilkoder undefined", () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.feiletRespons = {
        data: {
          data: {
            error: "Valideringsfeil",
            status: 404,
            message: "Valideringsfeil",
          },
        },
        status: STATUS.ERROR,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it("returnerer tom array ved data undefined", () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.feiletRespons = {
        data: {},
        status: STATUS.ERROR,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });
  });
});
