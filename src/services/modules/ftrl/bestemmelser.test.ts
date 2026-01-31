import { describe, it, expect, vi } from "vitest";
import { hentBestemmelser, hentPliktigeBestemmelser } from "./bestemmelser";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({ bestemmelser: [] }),
}));

describe("ftrl bestemmelser", () => {
  it("hentBestemmelser returnerer promise", () => {
    expect(hentBestemmelser("UTSENDING")).toBeInstanceOf(Promise);
  });

  it("hentBestemmelser aksepterer valgfri trygdedekning", () => {
    expect(hentBestemmelser("UTSENDING", "FULL")).toBeInstanceOf(Promise);
  });

  it("hentPliktigeBestemmelser returnerer promise", () => {
    expect(hentPliktigeBestemmelser()).toBeInstanceOf(Promise);
  });
});
