import { describe, it, expect, vi } from "vitest";
import {
  opprettHelseutgiftDekkesPeriode,
  oppdaterHelseutgiftDekkesPeriode,
  hentHelseutgiftDekkesPerioder,
  slettHelseutgiftDekkesPeriode,
} from "./helseutgiftDekkesPeriode";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue(undefined),
}));

const testData = { fomDato: "2024-01-01", tomDato: "2024-12-31", bostedLandkode: "NO" };

describe("helseutgiftDekkesPeriode", () => {
  it("opprettHelseutgiftDekkesPeriode returnerer promise", () => {
    expect(opprettHelseutgiftDekkesPeriode(1, testData)).toBeInstanceOf(Promise);
  });

  it("oppdaterHelseutgiftDekkesPeriode med periodeId returnerer promise", () => {
    expect(oppdaterHelseutgiftDekkesPeriode(1, 42, testData)).toBeInstanceOf(Promise);
  });

  it("hentHelseutgiftDekkesPerioder returnerer promise", () => {
    expect(hentHelseutgiftDekkesPerioder(1)).toBeInstanceOf(Promise);
  });

  it("slettHelseutgiftDekkesPeriode returnerer promise", () => {
    expect(slettHelseutgiftDekkesPeriode(1, 42)).toBeInstanceOf(Promise);
  });
});
