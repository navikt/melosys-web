import { describe, it, expect, vi } from "vitest";
import { hent, send, slett } from "./kontaktopplysninger";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue({}),
}));

describe("kontaktopplysninger", () => {
  it("hent returnerer promise", () => {
    expect(hent("123", "456")).toBeInstanceOf(Promise);
  });

  it("send returnerer promise", () => {
    expect(send("123", "456", {})).toBeInstanceOf(Promise);
  });

  it("slett returnerer promise", () => {
    expect(slett("123", "456")).toBeInstanceOf(Promise);
  });
});
