import { describe, it, expect, vi } from "vitest";
import { fatt } from "./vedtak";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("saksflyt vedtak", () => {
  it("fatt returnerer promise", () => {
    expect(
      fatt(1, {
        behandlingsresultatTypeKode: "INNVILGET",
        vedtakstype: null,
        mottakerinstitusjoner: [],
        nyVurderingBakgrunn: null,
      }),
    ).toBeInstanceOf(Promise);
  });
});
