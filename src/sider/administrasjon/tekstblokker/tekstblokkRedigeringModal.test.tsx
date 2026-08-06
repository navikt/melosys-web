import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { Tekstblokk } from "../../../services/modules/tekstblokker";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(),
  useBetingelseKatalog: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  tekstblokk: vi.fn(() => ({ data: undefined, isLoading: false }) as { data?: unknown; isLoading: boolean }),
  opprett: vi.fn(),
  oppdater: vi.fn(),
  opprettFeil: vi.fn((): Error | null => null),
  // Uten et tre faller Kontekstavgrensning tilbake på hele kodeverket. Det er standard
  // her, så testene under kan velge fritt; kaskaden testes for seg med et eget tre.
  kombinasjonstre: vi.fn(() => ({ data: undefined, isError: false }) as { data?: unknown; isError: boolean }),
}));

vi.mock("../../../services/api/kombinasjonstre", () => ({
  useKombinasjonstre: () => mocks.kombinasjonstre(),
}));

vi.mock("../../../services/api/tekstblokker", () => ({
  useTekstblokk: () => mocks.tekstblokk(),
  useOpprettTekstblokk: () => ({ mutate: mocks.opprett, isPending: false, error: mocks.opprettFeil() }),
  useOppdaterTekstblokk: () => ({ mutate: mocks.oppdater, isPending: false, error: null }),
}));

// Editoren stubbes: her handler det om katalogen, nøklene og requesten – ikke om Quill.
vi.mock("../../../felleskomponenter/htmlEditor/htmlEditor", () => ({
  default: ({
    gyldigeNokler,
    gyldigeBetingelsesNokler,
    value,
    onChange,
  }: {
    gyldigeNokler?: string[];
    gyldigeBetingelsesNokler?: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      aria-label="Innhold"
      data-testid="editor"
      data-gyldige-nokler={(gyldigeNokler ?? []).join(",")}
      data-gyldige-betingelser={(gyldigeBetingelsesNokler ?? []).join(",")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const katalog = [
  {
    nokkel: "soker-navn",
    visningsnavn: "Søkers navn",
    beskrivelse: "Fullt navn på søker",
    eksempel: "Ola Nordmann",
    sakstyper: ["FTRL"],
  },
];

const betingelseKatalog = [
  { nokkel: "avslag", visningsnavn: "Avslag", beskrivelse: "Saken er avslått", sakstyper: ["FTRL"] },
];

const mockKatalog = (verdi: object, betingelser: object = { data: [] }) => {
  vi.mocked(usePlaceholderKatalog).mockReturnValue(verdi as any);
  vi.mocked(useBetingelseKatalog).mockReturnValue(betingelser as any);
};

const visModal = (redigerId: number | null = null) =>
  render(<TekstblokkRedigeringModal redigerId={redigerId} type="TEKSTBLOKK" forslagTags={[]} onLukk={vi.fn()} />);

const lagret = (avgrensning: Partial<Tekstblokk> = {}): Tekstblokk => ({
  id: 7,
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: [],
  sakstyper: [],
  sakstemaer: [],
  behandlingstemaer: [],
  status: "PUBLISERT",
  registrertDato: "2026-01-01T00:00:00Z",
  registrertAv: "Z123456",
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  ...avgrensning,
});

describe("TekstblokkRedigeringModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tekstblokk.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("viser katalogen og gir editoren nøklene når togglen er på", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog });

    visModal();

    expect(screen.getByText("Tilgjengelige placeholdere")).toBeDefined();
    expect(screen.getByText("{soker-navn}")).toBeDefined();
    expect(screen.getByText(/\{velg:Alternativ A\|Alternativ B\}/)).toBeDefined();
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-nokler")).toBe("soker-navn");
  });

  it("gir editoren betingelsesnøklene, så en feilstavet {#hvis …} kan markeres ukjent", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog }, { data: betingelseKatalog });

    visModal();

    expect(screen.getByTestId("editor").getAttribute("data-gyldige-betingelser")).toBe("avslag");
  });

  it("viser ingen katalog og ingen nøkler når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });

    visModal();

    expect(screen.queryByText("Tilgjengelige placeholdere")).toBeNull();
    expect(usePlaceholderKatalog).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-nokler")).toBe("");
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-betingelser")).toBe("");
  });

  it("viser ingen katalog når hentingen feiler eller katalogen er tom", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: [] });

    visModal();

    expect(screen.queryByText("Tilgjengelige placeholdere")).toBeNull();
  });
});

describe("TekstblokkRedigeringModal – feilmelding ved lagring", () => {
  const apiFeil = (status: number, melding: string) => Object.assign(new Error(melding), { status });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });
    mocks.tekstblokk.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("viser api-ets forklaring fra responsbodyen, ikke statusteksten", () => {
    mocks.opprettFeil.mockReturnValue(
      Object.assign(apiFeil(400, "Bad Request"), {
        body: { message: "sakstyper: ugyldig kode EU_EOSS" },
      }),
    );

    visModal();

    expect(screen.getByText("sakstyper: ugyldig kode EU_EOSS")).toBeDefined();
    expect(screen.queryByText("Bad Request")).toBeNull();
  });

  it("faller tilbake til statusteksten når responsbodyen mangler melding", () => {
    mocks.opprettFeil.mockReturnValue(Object.assign(apiFeil(400, "Bad Request"), { body: {} }));

    visModal();

    expect(screen.getByText("Bad Request")).toBeDefined();
  });

  it("viser meldingen som den er for andre feil", () => {
    mocks.opprettFeil.mockReturnValue(apiFeil(500, "Internal Server Error"));

    visModal();

    expect(screen.getByText("Internal Server Error")).toBeDefined();
  });

  it("viser ingen feilmelding uten feil", () => {
    mocks.opprettFeil.mockReturnValue(null);

    visModal();

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("TekstblokkRedigeringModal – utkast", () => {
  const fyllUt = async () => {
    await userEvent.type(screen.getByRole("textbox", { name: "Tittel" }), "Ny blokk");
    await userEvent.type(screen.getByRole("textbox", { name: "Innhold" }), "Tekst");
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });
    mocks.tekstblokk.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("sender UTKAST fra «Lagre som utkast» ved opprettelse", async () => {
    visModal();
    await fyllUt();
    await userEvent.click(screen.getByRole("button", { name: "Lagre som utkast" }));

    expect(mocks.opprett).toHaveBeenCalledWith(expect.objectContaining({ status: "UTKAST" }), expect.anything());
  });

  it("publiserer fra hovedknappen ved opprettelse", async () => {
    visModal();
    await fyllUt();
    await userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(mocks.opprett).toHaveBeenCalledWith(expect.objectContaining({ status: "PUBLISERT" }), expect.anything());
  });

  // PUT er ingen statusbeslutning: utelates feltet, lar api-et statusen stå som den er.
  it("sender ingen status ved redigering, og har ingen egen utkast-knapp", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret({ status: "UTKAST" }), isLoading: false });

    visModal(7);
    await userEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    expect(screen.queryByRole("button", { name: "Lagre som utkast" })).toBeNull();
    const [{ body }] = mocks.oppdater.mock.calls[0] as [{ id: number; body: Record<string, unknown> }];
    expect(body).not.toHaveProperty("status");
    expect(mocks.oppdater).toHaveBeenCalledWith(
      { id: 7, body: expect.objectContaining({ tittel: "Om utsending" }) },
      expect.anything(),
    );
  });

  it("sender heller ingen status ved redigering av en publisert blokk", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });

    visModal(7);
    await userEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    const [{ body }] = mocks.oppdater.mock.calls[0] as [{ id: number; body: Record<string, unknown> }];
    expect(body).not.toHaveProperty("status");
  });
});

describe("TekstblokkRedigeringModal – kontekstavgrensning", () => {
  const velg = async (feltnavn: string, opsjon: string) => {
    await userEvent.click(screen.getByRole("combobox", { name: feltnavn }));
    await userEvent.click(screen.getByRole("option", { name: opsjon }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });
  });

  it("er tomme på en ny tekstblokk og sendes som tomme lister", async () => {
    mocks.tekstblokk.mockReturnValue({ data: undefined, isLoading: false });

    visModal();
    await userEvent.type(screen.getByRole("textbox", { name: "Tittel" }), "Ny blokk");
    await userEvent.type(screen.getByRole("textbox", { name: "Innhold" }), "Tekst");
    await userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(screen.queryByRole("button", { name: /EU\/EØS-land/ })).toBeNull();
    expect(mocks.opprett).toHaveBeenCalledWith(
      expect.objectContaining({ sakstyper: [], sakstemaer: [], behandlingstemaer: [] }),
      expect.anything(),
    );
  });

  it("initierer feltene fra den lagrede avgrensningen", () => {
    mocks.tekstblokk.mockReturnValue({
      data: lagret({ sakstyper: ["EU_EOS"], behandlingstemaer: ["ARBEID_KUN_NORGE"] }),
      isLoading: false,
    });

    visModal(7);

    expect(screen.getByRole("button", { name: /EU\/EØS-land/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /Arbeid kun i Norge/ })).toBeDefined();
  });

  it("holder avgrensningen skjult bak utvidelsen på en ny tekstblokk", () => {
    mocks.tekstblokk.mockReturnValue({ data: undefined, isLoading: false });

    visModal();

    const utvidelse = screen.getByRole("button", { name: "Avgrens til sakstype/sakstema/behandlingstema" });
    expect(utvidelse.getAttribute("aria-expanded")).toBe("false");
  });

  it("åpner utvidelsen når blokken allerede er avgrenset", () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret({ behandlingstemaer: ["ARBEID_KUN_NORGE"] }), isLoading: false });

    visModal(7);

    const utvidelse = screen.getByRole("button", { name: "Avgrens til sakstype/sakstema/behandlingstema" });
    expect(utvidelse.getAttribute("aria-expanded")).toBe("true");
  });

  it("lar admin åpne utvidelsen selv på en uavgrenset blokk", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });

    visModal(7);
    await userEvent.click(screen.getByRole("button", { name: "Avgrens til sakstype/sakstema/behandlingstema" }));

    expect(
      screen
        .getByRole("button", { name: "Avgrens til sakstype/sakstema/behandlingstema" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("sender endret avgrensning i requesten", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret({ sakstyper: ["EU_EOS"] }), isLoading: false });

    visModal(7);
    await velg("Gjelder sakstype", "Avtaleland");
    await velg("Gjelder behandlingstema", "Arbeid kun i Norge");
    await userEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    expect(mocks.oppdater).toHaveBeenCalledWith(
      {
        id: 7,
        body: expect.objectContaining({
          sakstyper: ["EU_EOS", "TRYGDEAVTALE"],
          sakstemaer: [],
          behandlingstemaer: ["ARBEID_KUN_NORGE"],
        }),
      },
      expect.anything(),
    );
  });
});

describe("TekstblokkRedigeringModal – varsel om sakstyper placeholderen ikke støtter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog }, { data: betingelseKatalog });
  });

  // Feltnavnet står i fet og deler listepunktet i flere noder; matcher på samlet tekst.
  const konfliktPunkt = (tekst: string) =>
    screen.getByText((_, element) => element?.tagName === "LI" && element.textContent === tekst);

  it("varsler når en placeholder ikke dekker sakstypen blokken er avgrenset til", () => {
    mocks.tekstblokk.mockReturnValue({
      data: lagret({ innhold: "<p>{soker-navn}</p>", sakstyper: ["EU_EOS"] }),
      isLoading: false,
    });

    visModal(7);

    const punkt = konfliktPunkt("Søkers navn støtter ikke: EU/EØS-land");
    // Feltnavnet skal skille seg fra resten av setningen.
    expect(punkt.querySelector("strong")?.textContent).toBe("Søkers navn");
  });

  it("varsler også for betingelser i teksten", () => {
    mocks.tekstblokk.mockReturnValue({
      data: lagret({ innhold: "<p>{#hvis avslag}Avslag{/hvis}</p>", sakstyper: ["EU_EOS"] }),
      isLoading: false,
    });

    visModal(7);

    expect(konfliktPunkt("Avslag støtter ikke: EU/EØS-land")).toBeDefined();
  });

  it("varsler med de støttede sakstypene når blokken gjelder alle", () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret({ innhold: "<p>{soker-navn}</p>" }), isLoading: false });

    visModal(7);

    expect(
      konfliktPunkt("Søkers navn støttes bare for: Utenfor avtaleland — blokken gjelder alle sakstyper"),
    ).toBeDefined();
    expect(screen.queryByText(/støtter ikke/)).toBeNull();
  });

  it("varsler ikke for en placeholder uten avgrensning i en blokk som gjelder alle", () => {
    mockKatalog({ data: [{ ...katalog[0], sakstyper: [] }] }, { data: betingelseKatalog });
    mocks.tekstblokk.mockReturnValue({ data: lagret({ innhold: "<p>{soker-navn}</p>" }), isLoading: false });

    visModal(7);

    expect(screen.queryByText(/støttes bare for/)).toBeNull();
  });

  it("varsler ikke når placeholderen dekker sakstypen", () => {
    mocks.tekstblokk.mockReturnValue({
      data: lagret({ innhold: "<p>{soker-navn}</p>", sakstyper: ["FTRL"] }),
      isLoading: false,
    });

    visModal(7);

    expect(screen.queryByText(/støtter ikke/)).toBeNull();
  });

  it("sjekker ingenting når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mocks.tekstblokk.mockReturnValue({
      data: lagret({ innhold: "<p>{soker-navn}</p>", sakstyper: ["EU_EOS"] }),
      isLoading: false,
    });

    visModal(7);

    expect(screen.queryByText(/støtter ikke/)).toBeNull();
    expect(useBetingelseKatalog).toHaveBeenCalledWith(false);
  });
});

describe("TekstblokkRedigeringModal – skjemaet ved refetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });
  });

  // React Query gir et nytt data-objekt ved bakgrunns-refetch; init-effekten skal ikke
  // kjøre om igjen og skrive over det admin holder på å skrive.
  it("beholder admins endringer når det kommer ferske data for samme blokk", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });
    const { rerender } = visModal(7);

    const tittel = screen.getByRole("textbox", { name: "Tittel" });
    await userEvent.clear(tittel);
    await userEvent.type(tittel, "Halvferdig tittel");

    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });
    rerender(<TekstblokkRedigeringModal redigerId={7} type="TEKSTBLOKK" forslagTags={[]} onLukk={vi.fn()} />);

    expect((screen.getByRole("textbox", { name: "Tittel" }) as HTMLInputElement).value).toBe("Halvferdig tittel");
  });

  it("fyller skjemaet på nytt når en annen blokk åpnes", () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });
    const { rerender } = visModal(7);

    mocks.tekstblokk.mockReturnValue({ data: lagret({ id: 8, tittel: "En annen blokk" }), isLoading: false });
    rerender(<TekstblokkRedigeringModal redigerId={8} type="TEKSTBLOKK" forslagTags={[]} onLukk={vi.fn()} />);

    expect((screen.getByRole("textbox", { name: "Tittel" }) as HTMLInputElement).value).toBe("En annen blokk");
  });
});
