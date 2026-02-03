import { describe, it, expect, vi } from "vitest";
import { hent, send } from "./svar";

vi.mock("../../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("anmodningsperioder svar", () => {
  it("hent returnerer promise", () => {
    expect(hent(1)).toBeInstanceOf(Promise);
  });

  it("send returnerer promise", () => {
    expect(
      send(1, {
        anmodningsperiodeSvarType: "GODKJENT",
        endretPeriode: { fom: null, tom: null },
        begrunnelseFritekst: "",
      }),
    ).toBeInstanceOf(Promise);
  });
});
