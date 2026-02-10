import { describe, it, expect, vi } from "vitest";
import {
  hentMedlemskapsperioder,
  opprettMedlemskapsperioder,
  oppdaterMedlemskapsperioder,
  slettMedlemskapsperiode,
  slettMedlemskapsperioder,
  opprettForeslåtteMedlemskapsperioder,
  harPerioderFraTidligereÅr,
} from "./medlemskapsperioder";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue({}),
}));

const testData = {
  fomDato: "2024-01-01",
  innvilgelsesResultat: "INNVILGET",
  bestemmelse: "ART12",
  trygdedekning: "FULL",
};

describe("medlemskapsperioder", () => {
  it("hentMedlemskapsperioder returnerer promise", () => {
    expect(hentMedlemskapsperioder(1)).toBeInstanceOf(Promise);
  });

  it("opprettMedlemskapsperioder returnerer promise", () => {
    expect(opprettMedlemskapsperioder(1, testData)).toBeInstanceOf(Promise);
  });

  it("oppdaterMedlemskapsperioder returnerer promise", () => {
    expect(oppdaterMedlemskapsperioder(1, 2, testData)).toBeInstanceOf(Promise);
  });

  it("slettMedlemskapsperiode returnerer promise", () => {
    expect(slettMedlemskapsperiode(1, 2)).toBeInstanceOf(Promise);
  });

  it("slettMedlemskapsperioder returnerer promise", () => {
    expect(slettMedlemskapsperioder(1)).toBeInstanceOf(Promise);
  });

  it("opprettForeslåtteMedlemskapsperioder returnerer promise", () => {
    expect(opprettForeslåtteMedlemskapsperioder(1, "ART12")).toBeInstanceOf(Promise);
  });
});

describe("harPerioderFraTidligereÅr", () => {
  it("returnerer false for tom liste", () => {
    expect(harPerioderFraTidligereÅr([])).toBe(false);
  });

  it("returnerer true når periode har fomDato fra tidligere år", () => {
    const perioder = [
      {
        id: 1,
        type: "MEDLEMSKAPSPERIODE" as const,
        fomDato: "2020-01-01",
        tomDato: "2020-12-31",
        bestemmelse: "A",
        innvilgelsesResultat: "I",
        trygdedekning: "F",
        medlemskapstype: "M",
      },
    ];
    expect(harPerioderFraTidligereÅr(perioder)).toBe(true);
  });

  it("returnerer false når alle perioder er fra inneværende år", () => {
    const år = new Date().getFullYear();
    const perioder = [
      {
        id: 1,
        type: "MEDLEMSKAPSPERIODE" as const,
        fomDato: `${år}-06-01`,
        tomDato: `${år}-12-31`,
        bestemmelse: "A",
        innvilgelsesResultat: "I",
        trygdedekning: "F",
        medlemskapstype: "M",
      },
    ];
    expect(harPerioderFraTidligereÅr(perioder)).toBe(false);
  });
});
