import { describe, it, expect, vi } from "vitest";
import { hentGyldigeTrygdedekninger } from "./gyldigeTrygdedekninger";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("gyldigeTrygdedekninger", () => {
  it("hentGyldigeTrygdedekninger returnerer promise", () => {
    expect(hentGyldigeTrygdedekninger("UTSENDING")).toBeInstanceOf(Promise);
  });

  it("hentGyldigeTrygdedekninger aksepterer valgfri bestemmelse", () => {
    expect(hentGyldigeTrygdedekninger("UTSENDING", "ART12")).toBeInstanceOf(Promise);
  });
});
