import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../../melosyskodeverk", () => ({
  default: {
    Koder: {
      anmodningsperiodesvartyper: {
        DELVIS_INNVILGELSE: "DELVIS_INNVILGELSE",
        INNVILGELSE: "INNVILGELSE",
      },
    },
  },
}));

vi.mock("../../../../../ducks/anmodningsperiodesvar", () => ({
  anmodningsperiodesvarSelectors: {
    AnmodningsperiodeSvarTypeSelector: vi.fn(),
    EndretPeriodeFomSelector: vi.fn(),
    EndretPeriodeTomSelector: vi.fn(),
  },
}));

vi.mock("../../../../../ducks/lovvalgsperioder", () => ({
  lovvalgsperioderSelectors: {
    TomDatoSelector: vi.fn(),
    FomDatoSelector: vi.fn(),
  },
}));

vi.mock("../../../../../ducks/anmodningsperioder", () => ({
  anmodningsperioderSelectors: {
    FomDatoSelector: vi.fn(),
    TomDatoSelector: vi.fn(),
  },
}));

vi.mock("../../../../../utils", () => ({
  dato: {
    datoDiffPure: vi.fn(),
  },
}));

import { hentLovvalgsperiode } from "./utils";

describe("hentLovvalgsperiode", () => {
  it("returnerer endret periode ved delvis innvilgelse", () => {
    const svar = {
      anmodningsperiodeSvarType: "DELVIS_INNVILGELSE",
      endretPeriode: { fom: "2024-01-01", tom: "2024-06-01" },
    } as any;
    const anmodning = { fomDato: "2024-01-01", tomDato: "2024-12-31" } as any;

    const resultat = hentLovvalgsperiode(svar, anmodning);
    expect(resultat).toEqual({ fom: "2024-01-01", tom: "2024-06-01" });
  });

  it("returnerer anmodningsperiode ved annen svartype", () => {
    const svar = {
      anmodningsperiodeSvarType: "INNVILGELSE",
      endretPeriode: { fom: "2024-01-01", tom: "2024-06-01" },
    } as any;
    const anmodning = { fomDato: "2024-03-01", tomDato: "2024-12-31" } as any;

    const resultat = hentLovvalgsperiode(svar, anmodning);
    expect(resultat).toEqual({ fom: "2024-03-01", tom: "2024-12-31" });
  });
});
