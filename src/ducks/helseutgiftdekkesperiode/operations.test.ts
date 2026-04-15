import { describe, it, expect } from "vitest";
import { hentHelseutgiftDekkesPeriode, oppdaterEllerOpprettHelseutgiftDekkesPeriode } from "./operations";

describe("helseutgiftdekkesperiode operations", () => {
  it("hentHelseutgiftDekkesPeriode returnerer thunk", () => {
    expect(typeof hentHelseutgiftDekkesPeriode(1)).toBe("function");
  });

  it("oppdaterEllerOpprettHelseutgiftDekkesPeriode med ny periode returnerer thunk", () => {
    expect(typeof oppdaterEllerOpprettHelseutgiftDekkesPeriode(1, {} as any, true)).toBe("function");
  });

  it("oppdaterEllerOpprettHelseutgiftDekkesPeriode med eksisterende periode returnerer thunk", () => {
    const data = { id: 99, fomDato: "2024-01-01", tomDato: "2024-12-31" } as any;
    expect(typeof oppdaterEllerOpprettHelseutgiftDekkesPeriode(1, data, false)).toBe("function");
  });

  it("oppdaterEllerOpprettHelseutgiftDekkesPeriode kaster feil ved oppdatering uten id", () => {
    expect(() => oppdaterEllerOpprettHelseutgiftDekkesPeriode(1, {} as any, false)).toThrow(
      "Kan ikke oppdatere helseutgift dekkes periode uten id",
    );
  });
});
