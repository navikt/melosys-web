import { describe, it, expect, vi } from "vitest";

const mockHent = vi.fn();

vi.mock("../../../../services/api", () => ({
  Fagsaker: {
    kontaktopplysninger: {
      hent: (...args: unknown[]) => mockHent(...args),
    },
  },
}));

import finnKontaktopplysninger from "./finnKontaktopplysninger";

describe("finnKontaktopplysninger", () => {
  it("returnerer kontaktopplysninger ved suksess", async () => {
    const mockResponse = { kontaktnavn: "Ola", kontaktorgnr: "123", kontakttelefon: "99999999" };
    mockHent.mockResolvedValue(mockResponse);

    const resultat = await finnKontaktopplysninger("SAK-1", "999888777");
    expect(resultat).toEqual(mockResponse);
    expect(mockHent).toHaveBeenCalledWith("SAK-1", "999888777");
  });

  it("returnerer null-verdier ved feil", async () => {
    mockHent.mockRejectedValue(new Error("API error"));

    const resultat = await finnKontaktopplysninger("SAK-1", "999888777");
    expect(resultat).toEqual({
      kontaktnavn: null,
      kontaktorgnr: null,
      kontakttelefon: null,
    });
  });
});
