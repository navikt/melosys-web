import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../felleskomponenter/stegvelger", () => ({
  FANE_STATUS: { UBEHANDLET: "UBEHANDLET" },
}));

vi.mock("../stegKomponenter/vurderingInngang/vurderingInngang", () => ({ VurderingInngang: "VurderingInngang" }));
vi.mock("../stegKomponenter/vurderingPeriode/vurderingPerioder", () => ({ VurderingPerioder: "VurderingPerioder" }));
vi.mock("../stegKomponenter/vurderingVedtak/vurderingVedtak", () => ({ VurderingVedtak: "VurderingVedtak" }));
vi.mock("../stegKomponenter/vurderingBestemmelse/vurderingBestemmelse", () => ({
  VurderingBestemmelse: "VurderingBestemmelse",
}));
vi.mock("../../../trygdeavgift/medlemskapsperiode/vurderingTrygdeavgift", () => ({
  VurderingTrygdeavgift: "VurderingTrygdeavgift",
}));

import { alleStegPensjonistFlyt } from "./stegListePensjonistFlyt";

describe("stegListePensjonistFlyt", () => {
  it("har 5 steg", () => {
    expect(alleStegPensjonistFlyt).toHaveLength(5);
  });

  it("har riktig rekkefølge", () => {
    expect(alleStegPensjonistFlyt.map((s) => s.id)).toEqual([
      "Inngang",
      "Bestemmelse",
      "Perioder",
      "Trygdeavgift",
      "Vedtak",
    ]);
  });

  it("har stigende stegPosisjon", () => {
    expect(alleStegPensjonistFlyt.map((s) => s.stegPosisjon)).toEqual([0, 1, 2, 3, 4]);
  });

  it("kun første steg er aktivt", () => {
    expect(alleStegPensjonistFlyt[0].aktivtSteg).toBe(true);
    expect(alleStegPensjonistFlyt.slice(1).every((s) => !s.aktivtSteg)).toBe(true);
  });

  it("kun siste steg er vedtakSteg", () => {
    expect(alleStegPensjonistFlyt[4].vedtakSteg).toBe(true);
    expect(alleStegPensjonistFlyt.slice(0, 4).every((s) => !s.vedtakSteg)).toBe(true);
  });
});
