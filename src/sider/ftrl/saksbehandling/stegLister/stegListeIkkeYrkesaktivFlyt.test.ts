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

import { alleStegIkkeYrkesaktivFlyt } from "./stegListeIkkeYrkesaktivFlyt";

describe("stegListeIkkeYrkesaktivFlyt", () => {
  it("har 4 steg", () => {
    expect(alleStegIkkeYrkesaktivFlyt).toHaveLength(4);
  });

  it("har riktig rekkefølge", () => {
    expect(alleStegIkkeYrkesaktivFlyt.map((s) => s.id)).toEqual(["Inngang", "Bestemmelse", "Perioder", "Vedtak"]);
  });

  it("har stigende stegPosisjon", () => {
    const posisjoner = alleStegIkkeYrkesaktivFlyt.map((s) => s.stegPosisjon);
    expect(posisjoner).toEqual([0, 1, 2, 3]);
  });

  it("kun første steg er aktivt", () => {
    expect(alleStegIkkeYrkesaktivFlyt[0].aktivtSteg).toBe(true);
    expect(alleStegIkkeYrkesaktivFlyt.slice(1).every((s) => !s.aktivtSteg)).toBe(true);
  });

  it("kun siste steg er vedtakSteg", () => {
    expect(alleStegIkkeYrkesaktivFlyt[3].vedtakSteg).toBe(true);
    expect(alleStegIkkeYrkesaktivFlyt.slice(0, 3).every((s) => !s.vedtakSteg)).toBe(true);
  });
});
