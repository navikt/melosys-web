import * as selectors from "./selectors";

describe("Utpekingsperioder selectors", () => {
  const lagState = (utpekingsperiode) => ({
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

      expect(selectors.FomDatoSelector(state)).toBe(forventetResultat);
    });
  });

  describe("TomDatoSelector", () => {
    it("returnerer tomDato", () => {
      const state = lagState({
        tomDato: "25.12.2014",
      });

      const forventetResultat = "25.12.2014";

      expect(selectors.TomDatoSelector(state)).toBe(forventetResultat);
    });
  });
});
