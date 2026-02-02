import { describe, it, expect, vi } from "vitest";
import { hentMottaksdato } from "./aarsak";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({ mottaksdato: "2024-01-01" }),
}));

describe("behandlinger aarsak", () => {
  it("hentMottaksdato returnerer promise", () => {
    expect(hentMottaksdato(1)).toBeInstanceOf(Promise);
  });
});
