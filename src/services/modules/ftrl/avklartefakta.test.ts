import { describe, it, expect, vi } from "vitest";
import { hentAvklarteFakta } from "./avklartefakta";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({ avklarteFakta: [] }),
}));

describe("avklartefakta", () => {
  it("hentAvklarteFakta returnerer promise", () => {
    expect(hentAvklarteFakta("BEST_1", 1)).toBeInstanceOf(Promise);
  });
});
