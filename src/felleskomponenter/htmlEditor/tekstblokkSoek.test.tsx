import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TekstblokkSoek from "./tekstblokkSoek";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../services/modules/tekstblokker";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

// Kun hentingen mockes – filtreringen i useFiltrerteTekstblokker er nettopp det vi tester.
vi.mock("../../services/api/tekstblokker", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../services/api/tekstblokker")>()),
  useTekstblokker: vi.fn(),
}));

const blokk = (id: number, tittel: string, sakstyper: string[], behandlingstemaer: string[]): TekstblokkOversikt => ({
  id,
  tittel,
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: [],
  sakstyper,
  behandlingstemaer,
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
});

const blokker = [
  blokk(1, "Gjelder alle saker", [], []),
  blokk(2, "Bare EU/EØS", ["EU_EOS"], []),
  blokk(3, "Bare pensjonist", [], ["PENSJONIST"]),
];

const sakskontekst = (sakstype: string, behandlingstema: string) => ({
  fagsaker: { data: { sakstype: { kode: sakstype } } },
  behandlinger: { data: { oppsummering: { behandlingstema: { kode: behandlingstema } } } },
});

const aapneSoek = async (preloadedState: object) => {
  renderWithProviders(<TekstblokkSoek onVelg={vi.fn()} />, { preloadedState });
  await userEvent.click(screen.getByRole("button", { name: "Legg til tekstblokker" }));
};

describe("TekstblokkSoek – kontekstavgrensning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    vi.mocked(useTekstblokker).mockReturnValue({ data: blokker, isLoading: false } as ReturnType<
      typeof useTekstblokker
    >);
  });

  it("skjuler blokker som er avgrenset til en annen kontekst", async () => {
    await aapneSoek(sakskontekst("EU_EOS", "UTSENDT_ARBEIDSTAKER"));

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.queryByText("Bare pensjonist")).toBeNull();
    expect(screen.getByText("2 tekstblokker")).toBeDefined();
  });

  it("viser alt når konteksten mangler (ingen sak, f.eks. i admin)", async () => {
    await aapneSoek({});

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.getByText("Bare pensjonist")).toBeDefined();
  });
});
