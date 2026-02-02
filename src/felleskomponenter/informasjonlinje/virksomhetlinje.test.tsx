import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../melosyskodeverk", () => ({
  default: { Koder: { aktoersroller: { VIRKSOMHET: "VIRKSOMHET" } } },
}));

vi.mock("../../services/api", () => ({
  Fagsaker: {
    aktoer: {
      hent: vi.fn(),
    },
  },
  Organisasjoner: {
    hentOrganisasjon: vi.fn(),
  },
}));

vi.mock("../../resources/images", () => ({
  Building: () => <span>ikon</span>,
}));

vi.mock("../kopierbarTekst", () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));

import * as Api from "../../services/api";
import Virksomhetlinje from "./virksomhetlinje";

describe("Virksomhetlinje", () => {
  it("viser organisasjonsdata ved suksess", async () => {
    vi.mocked(Api.Fagsaker.aktoer.hent).mockResolvedValue([{ orgnr: "123456789" }] as any);
    vi.mocked(Api.Organisasjoner.hentOrganisasjon).mockResolvedValue({
      navn: "Test AS",
      orgnr: "123456789",
    } as any);

    render(<Virksomhetlinje saksnummer="SAK-1" />);
    await waitFor(() => expect(screen.getByText("Test AS")).toBeDefined());
    expect(screen.getByText("123456789")).toBeDefined();
  });

  it("viser feilmelding når organisasjon ikke kan hentes", async () => {
    vi.mocked(Api.Fagsaker.aktoer.hent).mockResolvedValue([] as any);

    render(<Virksomhetlinje saksnummer="SAK-1" />);
    await waitFor(() => expect(screen.getByText("Klarte ikke hente organisasjonsopplysninger")).toBeDefined());
  });
});
