import { describe, it, expect, vi } from "vitest";
import { hentVilkår } from "./vilkår";

const mockGetAsJson = vi.fn().mockResolvedValue({ vilkår: [] });

vi.mock("../../utils", () => ({
  getAsJson: (...args: any[]) => mockGetAsJson(...args),
}));

describe("ftrl vilkår", () => {
  it("hentVilkår returnerer promise", () => {
    expect(hentVilkår("BEST_1", new Map(), 1, "UTSENDING")).toBeInstanceOf(Promise);
  });

  it("hentVilkår inkluderer avklarteFakta som query params", () => {
    const fakta = new Map([["nøkkel", "verdi"]]);
    hentVilkår("BEST_1", fakta, 1, "UTSENDING");
    expect(mockGetAsJson).toHaveBeenCalledWith(expect.stringContaining("nøkkel=verdi"));
  });
});
