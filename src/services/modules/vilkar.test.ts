import { describe, it, expect, vi } from "vitest";
import { hent, send, overstyrInngangvilkaar } from "./vilkar";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
  postAsJson: vi.fn().mockResolvedValue([]),
  putAsJson: vi.fn().mockResolvedValue({}),
}));

describe("vilkar", () => {
  it("hent returnerer promise", () => {
    expect(hent(1)).toBeInstanceOf(Promise);
  });

  it("send returnerer promise", () => {
    expect(send(1, [])).toBeInstanceOf(Promise);
  });

  it("overstyrInngangvilkaar returnerer promise", () => {
    expect(overstyrInngangvilkaar(1)).toBeInstanceOf(Promise);
  });
});
