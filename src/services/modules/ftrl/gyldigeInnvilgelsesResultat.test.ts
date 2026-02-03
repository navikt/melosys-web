import { describe, it, expect, vi } from "vitest";
import { hentGyldigeInnvilgelsesresultat } from "./gyldigeInnvilgelsesResultat";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("gyldigeInnvilgelsesResultat", () => {
  it("hentGyldigeInnvilgelsesresultat returnerer promise", () => {
    expect(hentGyldigeInnvilgelsesresultat("UTSENDING")).toBeInstanceOf(Promise);
  });
});
