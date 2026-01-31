import { describe, it, expect, vi } from "vitest";

vi.mock("../index", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

vi.mock("./hentBostedsadresseForPerson.generated", () => ({
  HentBostedsadresseForPersonDocument: "HentBostedsadresseForPersonDocument",
}));

import { hentBostedsadresseForPerson } from "./hentBostedsadresseForPerson";
import { apolloClient } from "../index";

describe("hentBostedsadresseForPerson", () => {
  it("returnerer personopplysninger ved suksess", async () => {
    const mockData = { bostedsadresse: { vegadresse: "Testgate 1" } };
    (apolloClient.query as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { hentPersonopplysninger: mockData },
    });

    const resultat = await hentBostedsadresseForPerson("12345678901");
    expect(resultat).toEqual(mockData);
  });

  it("returnerer null ved feil", async () => {
    (apolloClient.query as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("GraphQL error"));

    const resultat = await hentBostedsadresseForPerson("12345678901");
    expect(resultat).toBeNull();
  });
});
