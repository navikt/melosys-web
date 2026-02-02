import { describe, it, expect, vi } from "vitest";
import { godkjenn, ikkegodkjenn } from "./unntaksperioder";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("unntaksperioder", () => {
  it("godkjenn returnerer promise", () => {
    expect(
      godkjenn(1, { varsleUtland: false, fritekst: null, endretPeriode: null, lovvalgsbestemmelse: "ART12" }),
    ).toBeInstanceOf(Promise);
  });

  it("ikkegodkjenn returnerer promise", () => {
    expect(ikkegodkjenn(1, { ikkeGodkjentBegrunnelseKoder: [], begrunnelseFritekst: "test" })).toBeInstanceOf(Promise);
  });
});
