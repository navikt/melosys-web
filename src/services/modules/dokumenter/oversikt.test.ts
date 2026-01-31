import { describe, it, expect, vi } from "vitest";
import { hentOversikt } from "./oversikt";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("dokumenter oversikt", () => {
  it("hentOversikt returnerer promise", () => {
    expect(hentOversikt("123")).toBeInstanceOf(Promise);
  });
});
