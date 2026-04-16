import { describe, it, expect, vi } from "vitest";
import {
  opprettHelseutgiftDekkesPeriode,
  oppdaterHelseutgiftDekkesPeriode,
  hentHelseutgiftDekkesPeriode,
} from "./helseutgiftDekkesPeriode";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
}));

const testData = { fomDato: "2024-01-01", tomDato: "2024-12-31", bostedLandkode: "NO" };

describe("helseutgiftDekkesPeriode", () => {
  it("opprettHelseutgiftDekkesPeriode returnerer promise", () => {
    expect(opprettHelseutgiftDekkesPeriode(1, testData)).toBeInstanceOf(Promise);
  });

  it("oppdaterHelseutgiftDekkesPeriode returnerer promise", () => {
    expect(oppdaterHelseutgiftDekkesPeriode(1, testData)).toBeInstanceOf(Promise);
  });

  it("hentHelseutgiftDekkesPeriode returnerer promise", () => {
    expect(hentHelseutgiftDekkesPeriode(1)).toBeInstanceOf(Promise);
  });
});
