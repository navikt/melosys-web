import { describe, it, expect, vi } from "vitest";

vi.mock("../../felleskomponenter/stegvelger", () => ({
  FANE_STATUS: { UBEHANDLET: "UBEHANDLET" },
}));

vi.mock("./vurderingInngang", () => ({ default: () => null }));
vi.mock("./vurderingUnntakMedlemskap", () => ({ default: () => null }));

import { alleSteg } from "./initialStegArray";

describe("unntaksregistrering initialStegArray", () => {
  it("har to steg", () => {
    expect(alleSteg).toHaveLength(2);
  });

  it("første steg er Inngang", () => {
    expect(alleSteg[0].id).toBe("Inngang");
    expect(alleSteg[0].stegPosisjon).toBe(0);
    expect(alleSteg[0].aktivtSteg).toBe(true);
    expect(alleSteg[0].vedtakSteg).toBe(false);
  });

  it("andre steg er Unntak medlemskap", () => {
    expect(alleSteg[1].id).toBe("Unntak medlemskap");
    expect(alleSteg[1].stegPosisjon).toBe(1);
    expect(alleSteg[1].aktivtSteg).toBe(false);
    expect(alleSteg[1].vedtakSteg).toBe(false);
  });
});
