import * as selectors from "./selectors";
import { RootState } from "AppTypes";

interface UtpekingsperiodeData {
  fomDato?: string;
  tomDato?: string;
}

interface MockState {
  utpekingsperioder: {
    data: UtpekingsperiodeData[];
  };
}

describe("Utpekingsperioder selectors", () => {
  const lagState = (utpekingsperiode: UtpekingsperiodeData): MockState => ({
    utpekingsperioder: {
      data: [utpekingsperiode],
    },
  });

  describe("FomDatoSelector", () => {
    it("returnerer fomDato", () => {
      const state = lagState({
        fomDato: "11.11.2015",
      });

      const forventetResultat = "11.11.2015";

      expect(selectors.FomDatoSelector(state as RootState)).toBe(forventetResultat);
    });
  });

  describe("TomDatoSelector", () => {
    it("returnerer tomDato", () => {
      const state = lagState({
        tomDato: "25.12.2014",
      });

      const forventetResultat = "25.12.2014";

      expect(selectors.TomDatoSelector(state as RootState)).toBe(forventetResultat);
    });
  });
});
