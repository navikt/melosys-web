import { describe, it, expect } from "vitest";
import { tilpassPerioderTilNyeGrenser } from "./tilpassPerioder";

const helÅr = { fom: "2024-01-01", tom: "2024-12-31" };
const førsteHalvår = { fom: "2024-01-01", tom: "2024-06-30" };

describe("tilpassPerioderTilNyeGrenser", () => {
  it("forkorter en periode som dekker hele lovvalgsperioden", () => {
    const perioder = [{ fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "IKKE_SKATTEPLIKTIG" }];

    expect(tilpassPerioderTilNyeGrenser(perioder, helÅr, førsteHalvår)).toEqual([
      { fomDato: "01.01.2024", tomDato: "30.06.2024", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
    ]);
  });

  it("bevarer oppdelte perioder og klipper den som går utenfor", () => {
    const perioder = [
      { fomDato: "01.01.2024", tomDato: "31.03.2024" },
      { fomDato: "01.04.2024", tomDato: "31.12.2024" },
    ];

    expect(tilpassPerioderTilNyeGrenser(perioder, helÅr, førsteHalvår)).toEqual([
      { fomDato: "01.01.2024", tomDato: "31.03.2024" },
      { fomDato: "01.04.2024", tomDato: "30.06.2024" },
    ]);
  });

  it("fjerner perioder som havner helt utenfor", () => {
    const perioder = [
      { fomDato: "01.01.2024", tomDato: "30.06.2024" },
      { fomDato: "01.07.2024", tomDato: "31.12.2024" },
    ];

    expect(tilpassPerioderTilNyeGrenser(perioder, helÅr, førsteHalvår)).toEqual([
      { fomDato: "01.01.2024", tomDato: "30.06.2024" },
    ]);
  });

  it("lar perioder på den gamle grensen følge med ved forlengelse", () => {
    const perioder = [
      { fomDato: "01.01.2024", tomDato: "31.03.2024" },
      { fomDato: "01.04.2024", tomDato: "30.06.2024" },
    ];

    expect(tilpassPerioderTilNyeGrenser(perioder, førsteHalvår, helÅr)).toEqual([
      { fomDato: "01.01.2024", tomDato: "31.03.2024" },
      { fomDato: "01.04.2024", tomDato: "31.12.2024" },
    ]);
  });

  it("flytter fom når lovvalgsperioden starter senere", () => {
    const perioder = [{ fomDato: "01.01.2024", tomDato: "31.12.2024" }];

    expect(tilpassPerioderTilNyeGrenser(perioder, helÅr, { fom: "2024-03-01", tom: "2024-12-31" })).toEqual([
      { fomDato: "01.03.2024", tomDato: "31.12.2024" },
    ]);
  });

  it("lar perioder uten gyldige datoer være", () => {
    const perioder = [{ fomDato: "", tomDato: "" }];

    expect(tilpassPerioderTilNyeGrenser(perioder, helÅr, førsteHalvår)).toEqual(perioder);
  });
});
