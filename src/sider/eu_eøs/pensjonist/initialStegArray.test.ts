import { describe, it, expect, vi } from "vitest";

vi.mock("../../../felleskomponenter/stegvelger", () => ({
  FANE_STATUS: { UBEHANDLET: "UBEHANDLET" },
}));

vi.mock("./stegKomponenter/vurderingOpplysninger/vurderingOpplysninger", () => ({ default: () => null }));
vi.mock("./stegKomponenter/vurderingBekreftelse/vurderingBekreftelse", () => ({ default: () => null }));
vi.mock("../../../trygdeavgift/helseutgiftDekkesPeriode/vurderingTrygdeavgift", () => ({
  VurderingTrygdeavgift: () => null,
}));

import { alleSteg } from "./initialStegArray";

describe("pensjonist initialStegArray", () => {
  it("har tre steg", () => {
    expect(alleSteg).toHaveLength(3);
  });

  it("første steg er Inngang (aktivt)", () => {
    expect(alleSteg[0].id).toBe("Inngang");
    expect(alleSteg[0].stegPosisjon).toBe(0);
    expect(alleSteg[0].aktivtSteg).toBe(true);
    expect(alleSteg[0].vedtakSteg).toBe(false);
  });

  it("andre steg er Trygdeavgift", () => {
    expect(alleSteg[1].id).toBe("Trygdeavgift");
    expect(alleSteg[1].stegPosisjon).toBe(1);
  });

  it("tredje steg er Bekreftelse (vedtakSteg)", () => {
    expect(alleSteg[2].id).toBe("Bekreftelse");
    expect(alleSteg[2].stegPosisjon).toBe(2);
    expect(alleSteg[2].vedtakSteg).toBe(true);
  });
});
