import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TekstblokkSoek from "./tekstblokkSoek";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../services/modules/tekstblokker";
import { tekstblokkOversikt } from "../../services/modules/tekstblokkTestdata";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

// Kun hentingen mockes – filtreringen i useFiltrerteTekstblokker er nettopp det vi tester.
vi.mock("../../services/api/tekstblokker", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../services/api/tekstblokker")>()),
  useTekstblokker: vi.fn(),
}));

const blokk = (id: number, tittel: string, sakstyper: string[], behandlingstemaer: string[]): TekstblokkOversikt =>
  tekstblokkOversikt({ id, tittel, sakstyper, behandlingstemaer });

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

  it("sier fra når avgrensningen alene tømmer lista, og «Vis alle» viser resten", async () => {
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [blokk(2, "Bare EU/EØS", ["EU_EOS"], [])],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek(sakskontekst("FTRL", "PENSJONIST"));

    expect(screen.getByText("Ingen tekstblokker gjelder denne saken (sakstype/behandlingstema).")).toBeDefined();
    expect(screen.queryByText(/Prøv et annet søkeord/)).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Vis alle" }));

    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.queryByText(/gjelder denne saken/)).toBeNull();
  });

  // Andre blokker gjelder fortsatt saken – det er bare søketreffene som ligger utenfor.
  it("tilbyr «Vis alle» sammen med søkerådet når søket bare treffer utenfor konteksten", async () => {
    await aapneSoek(sakskontekst("FTRL", "PENSJONIST"));
    await userEvent.type(screen.getByRole("searchbox", { name: "Søk på tittel eller tag" }), "EU/EØS");

    expect(
      screen.getByText("Treffene for filtrene dine gjelder ikke denne saken (sakstype/behandlingstema)."),
    ).toBeDefined();
    expect(screen.queryByText(/Ingen tekstblokker gjelder denne saken/)).toBeNull();
    expect(screen.getByText(/Prøv et annet søkeord/)).toBeDefined();

    await userEvent.click(screen.getByRole("button", { name: "Vis alle" }));

    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
  });

  it("beholder søketeksten i tomtilstanden når søket er det som tømmer lista", async () => {
    await aapneSoek(sakskontekst("EU_EOS", "UTSENDT_ARBEIDSTAKER"));
    await userEvent.type(screen.getByRole("searchbox", { name: "Søk på tittel eller tag" }), "finnesikke");

    expect(screen.getByText(/Prøv et annet søkeord/)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Vis alle" })).toBeNull();
  });
});

describe("TekstblokkSoek – statusfilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  // Api-et skal alt ha filtrert bort utkast; dette er klientsidevernet mot en regresjon der.
  it("viser ikke utkast selv om api-et skulle levere dem", async () => {
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [blokk(1, "Gjelder alle saker", [], []), { ...blokk(9, "Uferdig utkast", [], []), status: "UTKAST" }],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek({});

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.queryByText("Uferdig utkast")).toBeNull();
  });

  it("skylder ikke på konteksten når bare utkast-filtreringen tømmer lista", async () => {
    // Typisk under utrulling: alle blokker av typen er fortsatt utkast. Da skal
    // tomtilstanden verken peke på sakstype/behandlingstema eller tilby en «Vis alle»
    // som ikke kan hjelpe (statusfilteret består uansett).
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [{ ...blokk(9, "Uferdig utkast", [], []), status: "UTKAST" }],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek(sakskontekst("FTRL", "PENSJONIST"));

    expect(screen.getByText("Fant ingen tekstblokker")).toBeDefined();
    expect(screen.queryByText(/gjelder denne saken/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Vis alle" })).toBeNull();
    expect(screen.queryByText(/Prøv et annet søkeord/)).toBeNull();
  });
});
