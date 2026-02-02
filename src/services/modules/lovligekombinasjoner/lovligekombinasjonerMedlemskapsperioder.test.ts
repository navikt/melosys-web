import { describe, it, expect, vi } from "vitest";
import { hentTrygdedekninger } from "./lovligekombinasjonerMedlemskapsperioder";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("lovligekombinasjonerMedlemskapsperioder", () => {
  it("hentTrygdedekninger returnerer promise", () => {
    expect(hentTrygdedekninger("ART12")).toBeInstanceOf(Promise);
  });
});
