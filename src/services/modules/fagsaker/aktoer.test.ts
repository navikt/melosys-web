import { describe, it, expect, vi } from "vitest";
import { hent, send, slett } from "./aktoer";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
  postAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue({}),
}));

describe("aktoer", () => {
  it("hent returnerer promise", () => {
    expect(hent("123", "ARBEIDSTAKER")).toBeInstanceOf(Promise);
  });

  it("send returnerer promise", () => {
    expect(send("123", { rolleKode: "ARBEIDSTAKER" })).toBeInstanceOf(Promise);
  });

  it("slett returnerer promise", () => {
    expect(slett(1)).toBeInstanceOf(Promise);
  });
});
