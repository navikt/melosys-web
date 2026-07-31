import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TekstblokkRedigeringModal from "./tekstblokkRedigeringModal";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";
import { Tekstblokk } from "../../../services/modules/tekstblokker";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  tekstblokk: vi.fn(() => ({ data: undefined, isLoading: false }) as { data?: unknown; isLoading: boolean }),
  opprett: vi.fn(),
  oppdater: vi.fn(),
  opprettFeil: vi.fn((): Error | null => null),
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
    value,
    onChange,
  }: {
    gyldigeNokler?: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      aria-label="Innhold"
      data-testid="editor"
      data-gyldige-nokler={(gyldigeNokler ?? []).join(",")}
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

const mockKatalog = (verdi: object) => vi.mocked(usePlaceholderKatalog).mockReturnValue(verdi as any);

const visModal = (redigerId: number | null = null) =>
  render(<TekstblokkRedigeringModal redigerId={redigerId} type="TEKSTBLOKK" forslagTags={[]} onLukk={vi.fn()} />);

const lagret = (avgrensning: Partial<Tekstblokk> = {}): Tekstblokk => ({
  id: 7,
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: [],
  sakstyper: [],
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

  it("viser ingen katalog og ingen nøkler når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: undefined });

    visModal();

    expect(screen.queryByText("Tilgjengelige placeholdere")).toBeNull();
    expect(usePlaceholderKatalog).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("editor").getAttribute("data-gyldige-nokler")).toBe("");
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

  it("oversetter 400 til en forståelig melding", () => {
    mocks.opprettFeil.mockReturnValue(apiFeil(400, "JSON parse error: Cannot deserialize value of type Sakstype"));

    visModal();

    expect(screen.getByText("Ugyldig verdi i avgrensningen — last siden på nytt og prøv igjen")).toBeDefined();
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

  it("beholder utkast-statusen ved redigering, uten egen utkast-knapp", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret({ status: "UTKAST" }), isLoading: false });

    visModal(7);
    await userEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    expect(screen.queryByRole("button", { name: "Lagre som utkast" })).toBeNull();
    expect(mocks.oppdater).toHaveBeenCalledWith(
      { id: 7, body: expect.objectContaining({ status: "UTKAST" }) },
      expect.anything(),
    );
  });

  it("beholder publisert status ved redigering av en publisert blokk", async () => {
    mocks.tekstblokk.mockReturnValue({ data: lagret(), isLoading: false });

    visModal(7);
    await userEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    expect(mocks.oppdater).toHaveBeenCalledWith(
      { id: 7, body: expect.objectContaining({ status: "PUBLISERT" }) },
      expect.anything(),
    );
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
      expect.objectContaining({ sakstyper: [], behandlingstemaer: [] }),
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
          behandlingstemaer: ["ARBEID_KUN_NORGE"],
        }),
      },
      expect.anything(),
    );
  });
});
