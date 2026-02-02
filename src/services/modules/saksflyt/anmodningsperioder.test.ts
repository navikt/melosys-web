import { describe, it, expect, vi } from "vitest";
import { bestill, svar } from "./anmodningsperioder";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("saksflyt anmodningsperioder", () => {
  it("bestill returnerer promise", () => {
    expect(bestill(1, { mottakerinstitusjon: null, fritekstSed: null, vedlegg: [] })).toBeInstanceOf(Promise);
  });

  it("svar returnerer promise", () => {
    expect(svar(1, { ytterligereInfo: null })).toBeInstanceOf(Promise);
  });
});
