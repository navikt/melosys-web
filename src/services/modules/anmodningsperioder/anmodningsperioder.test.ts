import { describe, it, expect, vi } from "vitest";
import { send, hent } from "./anmodningsperioder";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("anmodningsperioder", () => {
  it("send returnerer promise", () => {
    expect(send(1, { anmodningsperioder: [] })).toBeInstanceOf(Promise);
  });

  it("hent returnerer promise", () => {
    expect(hent(1)).toBeInstanceOf(Promise);
  });
});
