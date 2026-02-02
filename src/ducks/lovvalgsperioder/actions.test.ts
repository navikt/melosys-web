import { describe, it, expect } from "vitest";
import { oppdaterLovvalgsperioderState, resetLovvalgsperioderState, endrePeriode } from "./actions";
import * as Types from "./types";

describe("lovvalgsperioder actions", () => {
  it("resetLovvalgsperioderState returnerer RESET action", () => {
    expect(resetLovvalgsperioderState()).toEqual({ type: Types.RESET });
  });

  it("oppdaterLovvalgsperioderState returnerer OPPDATER_LOVVALGSPERIODER action", () => {
    const perioder = [{ fomDato: "2024-01-01" }] as any;
    expect(oppdaterLovvalgsperioderState(perioder)).toEqual({
      type: Types.OPPDATER_LOVVALGSPERIODER,
      data: perioder,
    });
  });

  it("endrePeriode returnerer ENDRE_PERIODE action med fom og tom", () => {
    expect(endrePeriode("2024-01-01", "2024-12-31")).toEqual({
      type: Types.ENDRE_PERIODE,
      data: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
    });
  });

  it("endrePeriode uten tomDato setter undefined", () => {
    const result = endrePeriode("2024-01-01");
    expect(result.data.fomDato).toBe("2024-01-01");
    expect(result.data.tomDato).toBeUndefined();
  });
});
