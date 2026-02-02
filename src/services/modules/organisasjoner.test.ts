import { describe, it, expect, vi } from "vitest";
import { hentOrganisasjon } from "./organisasjoner";

vi.mock("../utils", () => ({
  cachedGetAsJson: vi.fn().mockResolvedValue({ navn: "Test AS" }),
}));

describe("organisasjoner", () => {
  it("hentOrganisasjon er en funksjon", () => {
    expect(typeof hentOrganisasjon).toBe("function");
  });

  it("hentOrganisasjon returnerer promise", () => {
    const result = hentOrganisasjon("123456789");
    expect(result).toBeInstanceOf(Promise);
  });
});
