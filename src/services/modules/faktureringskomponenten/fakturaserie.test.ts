import { describe, it, expect, vi } from "vitest";
import { hentFakturaserier, hentFakturaserie } from "./fakturaserie";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("fakturaserie", () => {
  it("hentFakturaserier returnerer promise", () => {
    expect(hentFakturaserier("REF-123")).toBeInstanceOf(Promise);
  });

  it("hentFakturaserie returnerer promise", () => {
    expect(hentFakturaserie("REF-123")).toBeInstanceOf(Promise);
  });
});
