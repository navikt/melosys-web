import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TekstblokkSoek from "./tekstblokkSoek";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { useTekstblokker } from "../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../services/modules/tekstblokker";
import { tekstblokkOversikt } from "../../services/modules/tekstblokkTestdata";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

// Kun hentingen mockes – filtreringen i useFiltrerteTekstblokker er nettopp det vi tester.
vi.mock("../../services/api/tekstblokker", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../services/api/tekstblokker")>()),
  useTekstblokker: vi.fn(),
}));

const blokk = (
  id: number,
  tittel: string,
  avgrensning: Partial<Pick<TekstblokkOversikt, "sakstyper" | "sakstemaer" | "behandlingstemaer">> = {},
): TekstblokkOversikt =>
  tekstblokkOversikt({
    id,
    tittel,
    sakstyper: avgrensning.sakstyper ?? [],
    sakstemaer: avgrensning.sakstemaer ?? [],
    behandlingstemaer: avgrensning.behandlingstemaer ?? [],
  });

const blokker = [
  blokk(1, "Gjelder alle saker"),
  blokk(2, "Bare EU/EØS", { sakstyper: ["EU_EOS"] }),
  blokk(3, "Bare lovvalg", { sakstemaer: ["MEDLEMSKAP_LOVVALG"] }),
  blokk(4, "Bare pensjonist", { behandlingstemaer: ["PENSJONIST"] }),
];

const sakskontekst = (sakstype: string, sakstema: string, behandlingstema: string) => ({
  fagsaker: { data: { sakstype: { kode: sakstype }, sakstema: { kode: sakstema } } },
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
    await aapneSoek(sakskontekst("EU_EOS", "MEDLEMSKAP_LOVVALG", "UTSENDT_ARBEIDSTAKER"));

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.getByText("Bare lovvalg")).toBeDefined();
    expect(screen.queryByText("Bare pensjonist")).toBeNull();
    expect(screen.getByText("3 tekstblokker")).toBeDefined();
  });

  it("avgrenser ogsaa paa sakstema", async () => {
    await aapneSoek(sakskontekst("EU_EOS", "TRYGDEAVGIFT", "UTSENDT_ARBEIDSTAKER"));

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.queryByText("Bare lovvalg")).toBeNull();
    expect(screen.queryByText("Bare pensjonist")).toBeNull();
  });

  it("viser alt når konteksten mangler (ingen sak, f.eks. i admin)", async () => {
    await aapneSoek({});

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.getByText("Bare lovvalg")).toBeDefined();
    expect(screen.getByText("Bare pensjonist")).toBeDefined();
  });

  it("sier fra når avgrensningen alene tømmer lista, og «Vis alle» viser resten", async () => {
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [blokk(2, "Bare EU/EØS", { sakstyper: ["EU_EOS"] })],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek(sakskontekst("FTRL", "TRYGDEAVGIFT", "PENSJONIST"));

    expect(
      screen.getByText("Ingen tekstblokker gjelder denne saken (sakstype/sakstema/behandlingstema)."),
    ).toBeDefined();
    expect(screen.queryByText(/Prøv et annet søkeord/)).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Vis alle" }));

    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
    expect(screen.queryByText(/gjelder denne saken/)).toBeNull();
  });

  // Andre blokker gjelder fortsatt saken – det er bare søketreffene som ligger utenfor.
  it("tilbyr «Vis alle» sammen med søkerådet når søket bare treffer utenfor konteksten", async () => {
    await aapneSoek(sakskontekst("FTRL", "TRYGDEAVGIFT", "PENSJONIST"));
    await userEvent.type(screen.getByRole("searchbox", { name: "Søk på tittel eller tag" }), "EU/EØS");

    expect(
      screen.getByText("Treffene for filtrene dine gjelder ikke denne saken (sakstype/sakstema/behandlingstema)."),
    ).toBeDefined();
    expect(screen.queryByText(/Ingen tekstblokker gjelder denne saken/)).toBeNull();
    expect(screen.getByText(/Prøv et annet søkeord/)).toBeDefined();

    await userEvent.click(screen.getByRole("button", { name: "Vis alle" }));

    expect(screen.getByText("Bare EU/EØS")).toBeDefined();
  });

  it("beholder søketeksten i tomtilstanden når søket er det som tømmer lista", async () => {
    await aapneSoek(sakskontekst("EU_EOS", "MEDLEMSKAP_LOVVALG", "UTSENDT_ARBEIDSTAKER"));
    await userEvent.type(screen.getByRole("searchbox", { name: "Søk på tittel eller tag" }), "finnesikke");

    expect(screen.getByText(/Prøv et annet søkeord/)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Vis alle" })).toBeNull();
  });
});

describe("TekstblokkSoek – advarsel om tokener editoren ikke løser", () => {
  const ADVARSEL = "Inneholder felter som ikke fylles ut her";
  const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

  const aapneMedInnhold = async (innhold: string, props: Partial<{ placeholderVerdier: PlaceholderVerdi[] }> = {}) => {
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [tekstblokkOversikt({ tittel: "Om avslag", innhold })],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    renderWithProviders(<TekstblokkSoek onVelg={vi.fn()} {...props} />, { preloadedState: {} });
    await userEvent.click(screen.getByRole("button", { name: "Legg til tekstblokker" }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("advarer om en betingelsesblokk når editoren mangler placeholder-kontekst", async () => {
    await aapneMedInnhold("<p>{#hvis avslag}Avslag{/hvis}</p>");

    expect(screen.getByText(ADVARSEL)).toBeDefined();
    expect(screen.getByText(/må fjernes eller fylles ut manuelt etterpå/)).toBeDefined();
  });

  it("advarer også om et valgtoken", async () => {
    await aapneMedInnhold("<p>Du får {velg:innvilget|avslag}.</p>");

    expect(screen.getByText(ADVARSEL)).toBeDefined();
  });

  it("lar blokken settes inn selv om den er advart om", async () => {
    await aapneMedInnhold("<p>{#hvis avslag}Avslag{/hvis}</p>");

    expect(screen.getByRole("button", { name: "Sett inn" })).toBeEnabled();
  });

  it("advarer ikke når editoren har placeholder-kontekst (Send brev)", async () => {
    await aapneMedInnhold("<p>{#hvis avslag}Avslag{/hvis}</p>", { placeholderVerdier: verdier });

    expect(screen.queryByText(ADVARSEL)).toBeNull();
  });

  it("advarer aldri om en blokk uten betingelser eller valg", async () => {
    await aapneMedInnhold("<p>Saken {saksnummer} er mottatt. Fyll ut [navn].</p>");

    expect(screen.queryByText(ADVARSEL)).toBeNull();
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
      data: [blokk(1, "Gjelder alle saker"), { ...blokk(9, "Uferdig utkast"), status: "UTKAST" }],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek({});

    expect(screen.getByText("Gjelder alle saker")).toBeDefined();
    expect(screen.queryByText("Uferdig utkast")).toBeNull();
  });

  it("skylder ikke på konteksten når bare utkast-filtreringen tømmer lista", async () => {
    // Er alle blokkene av typen utkast, skal tomtilstanden verken peke på
    // sakstype/behandlingstema eller tilby en «Vis alle» som ikke kan hjelpe:
    // statusfilteret består uansett.
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [{ ...blokk(9, "Uferdig utkast"), status: "UTKAST" }],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);

    await aapneSoek(sakskontekst("FTRL", "TRYGDEAVGIFT", "PENSJONIST"));

    expect(screen.getByText("Fant ingen tekstblokker")).toBeDefined();
    expect(screen.queryByText(/gjelder denne saken/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Vis alle" })).toBeNull();
    expect(screen.queryByText(/Prøv et annet søkeord/)).toBeNull();
  });
});

describe("TekstblokkSoek – bibliotekmodus", () => {
  const skrivTekst = vi.fn();

  const aapneBiblioteket = async () => {
    renderWithProviders(<TekstblokkSoek modus="bibliotek" knappetekst="Brev- og tekstbibliotek" />, {
      preloadedState: sakskontekst("EU_EOS", "MEDLEMSKAP_LOVVALG", "UTSENDT_ARBEIDSTAKER"),
    });
    await userEvent.click(screen.getByRole("button", { name: "Brev- og tekstbibliotek" }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [{ ...blokk(1, "Om utsending"), innhold: "<p>Du er <strong>utsendt</strong></p><p>Hilsen Nav</p>" }],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);
    skrivTekst.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: skrivTekst },
      configurable: true,
    });
  });

  it("tilbyr kopiering i stedet for innsetting, siden det ikke finnes en editor å skrive til", async () => {
    await aapneBiblioteket();

    expect(screen.getByRole("button", { name: "Kopier til utklippstavle" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Sett inn" })).toBeNull();
  });

  it("kopierer blokken som ren tekst, med avsnittene beholdt som linjeskift", async () => {
    await aapneBiblioteket();
    await userEvent.click(screen.getByRole("button", { name: "Kopier til utklippstavle" }));

    expect(skrivTekst).toHaveBeenCalledWith("Du er utsendt\n\nHilsen Nav");
  });

  it("bekrefter kopieringen, men lar popoveren stå så flere blokker kan kopieres", async () => {
    await aapneBiblioteket();
    await userEvent.click(screen.getByRole("button", { name: "Kopier til utklippstavle" }));

    expect(screen.getByRole("button", { name: "Kopiert" })).toBeDefined();
    expect(screen.getByText("Om utsending")).toBeDefined();
  });

  it("sier fra når nettleseren nekter tilgang til utklippstavla", async () => {
    skrivTekst.mockRejectedValue(new Error("Nektet"));
    await aapneBiblioteket();
    await userEvent.click(screen.getByRole("button", { name: "Kopier til utklippstavle" }));

    expect(screen.getByRole("button", { name: "Kunne ikke kopiere" })).toBeDefined();
  });

  it("lenker til hele biblioteket i ny fane, så saken ikke går tapt", async () => {
    await aapneBiblioteket();

    const lenke = screen.getByRole("link", { name: /Åpne biblioteket/ });
    expect(lenke.getAttribute("href")).toBe("/melosys/brevbibliotek");
    expect(lenke.getAttribute("target")).toBe("_blank");
    expect(lenke.getAttribute("rel")).toContain("noopener");
  });

  it("beholder lukkeknappen ved siden av lenken", async () => {
    await aapneBiblioteket();

    expect(screen.getByRole("button", { name: "Lukk" })).toBeDefined();
  });
});
