import { describe, it, expect, vi } from "vitest";

vi.mock("../index", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

vi.mock("./hentnavn.generated", () => ({
  HentNavnDocument: "HentNavnDocument",
}));

vi.mock("../../utils", () => ({
  person: {
    tilSammensattNavnFraObjekt: vi.fn(() => "MockNavn"),
  },
}));

import { hentSammensattNavn } from "./hentSammensattNavn";
import { apolloClient } from "../index";

describe("hentSammensattNavn", () => {
  it("returnerer sammensatt navn ved suksess", async () => {
    (apolloClient.query as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { hentPersonopplysninger: { navn: { fornavn: "Ola" } } },
    });

    const resultat = await hentSammensattNavn("12345678901");
    expect(resultat).toBe("MockNavn");
  });

  it("returnerer tom streng når navn mangler", async () => {
    (apolloClient.query as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { hentPersonopplysninger: { navn: null } },
    });

    const resultat = await hentSammensattNavn("12345678901");
    expect(resultat).toBe("");
  });

  it("returnerer tom streng ved feil", async () => {
    (apolloClient.query as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("GraphQL error"));

    const resultat = await hentSammensattNavn("12345678901");
    expect(resultat).toBe("");
  });
});
