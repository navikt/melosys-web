import { describe, it, expect, vi } from "vitest";
import { hentFlyt, sendFlyt, oppfriskFlyt, slettFlyt } from "./flyt";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue({}),
}));

describe("trygdeavtale flyt", () => {
  it("hentFlyt returnerer promise", () => {
    expect(hentFlyt(1)).toBeInstanceOf(Promise);
  });

  it("sendFlyt returnerer promise", () => {
    expect(sendFlyt(1, {})).toBeInstanceOf(Promise);
  });

  it("oppfriskFlyt returnerer promise", () => {
    expect(oppfriskFlyt(1)).toBeInstanceOf(Promise);
  });

  it("slettFlyt returnerer promise", () => {
    expect(slettFlyt(1)).toBeInstanceOf(Promise);
  });
});
