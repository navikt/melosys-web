import { describe, it, expect, vi } from "vitest";
import { iverksettPensjonist } from "./trygdeavgift";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("trygdeavgift", () => {
  it("iverksettPensjonist returnerer promise", () => {
    expect(iverksettPensjonist(1, { behandlingsresultatTypeKode: "INNVILGET", vedtakstype: null })).toBeInstanceOf(
      Promise,
    );
  });
});
