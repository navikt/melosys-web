import { describe, it, expect, vi } from "vitest";
import { hentPersonAdresse, hentOrganisasjonAdresse } from "./adresser";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
}));

describe("adresser", () => {
  it("hentPersonAdresse returnerer promise", () => {
    expect(hentPersonAdresse("12345678901")).toBeInstanceOf(Promise);
  });

  it("hentOrganisasjonAdresse returnerer promise", () => {
    expect(hentOrganisasjonAdresse("123456789")).toBeInstanceOf(Promise);
  });
});
