import { describe, it, expect, vi } from "vitest";

vi.mock("../../felleskomponenter/stegvelger", () => ({
  FANE_STATUS: { UBEHANDLET: "UBEHANDLET" },
}));

vi.mock("./stegKomponenter/vurderingVedtak/vurderingVedtak", () => ({
  VurderingVedtak: () => null,
}));

vi.mock("./stegKomponenter/vurderingAarsavregning/vurderingAarsavregningInngang", () => ({
  VurderingAarsavregningInngang: () => null,
}));

import { alleSteg } from "./initialStegArray";

describe("initialStegArray", () => {
  it("har to steg", () => {
    expect(alleSteg).toHaveLength(2);
  });

  it("første steg er Årsavregning", () => {
    expect(alleSteg[0].id).toBe("Årsavregning");
    expect(alleSteg[0].stegPosisjon).toBe(0);
    expect(alleSteg[0].aktivtSteg).toBe(true);
    expect(alleSteg[0].vedtakSteg).toBe(false);
  });

  it("andre steg er Vedtak", () => {
    expect(alleSteg[1].id).toBe("Vedtak");
    expect(alleSteg[1].stegPosisjon).toBe(1);
    expect(alleSteg[1].aktivtSteg).toBe(false);
    expect(alleSteg[1].vedtakSteg).toBe(true);
  });
});
