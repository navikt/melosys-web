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
    expect(typeof oppdaterEllerOpprettHelseutgiftDekkesPeriode(1, {} as any, false)).toBe("function");
  });
});
