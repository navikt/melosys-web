import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BrevbibliotekKnapp from "./brevbibliotekKnapp";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { useTekstblokker } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";
import { tekstblokkOversikt } from "../../../services/modules/tekstblokkTestdata";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({ default: vi.fn() }));

vi.mock("../../../services/api/tekstblokker", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../services/api/tekstblokker")>()),
  useTekstblokker: vi.fn(),
}));

const visPaa = (sti: string) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[sti]}>
      <BrevbibliotekKnapp />
    </MemoryRouter>,
  );

describe("BrevbibliotekKnapp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [] as TekstblokkOversikt[],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);
  });

  it("lenker til biblioteksiden utenfor en sak, der det ikke finnes kontekst å avgrense mot", () => {
    visPaa("/");

    expect(screen.getByRole("link", { name: "Brev- og tekstbibliotek" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Brev- og tekstbibliotek" })).toBeNull();
  });

  it("åpner et oppslag i saken i stedet for å navigere bort fra den", () => {
    visPaa("/EU_EOS/saksbehandling/2024-123");

    expect(screen.getByRole("button", { name: "Brev- og tekstbibliotek" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Brev- og tekstbibliotek" })).toBeNull();
  });

  it("kjenner igjen saksruter uten «saksbehandling» i stien", () => {
    visPaa("/FTRL/aarsavregning/2024-123");

    expect(screen.getByRole("button", { name: "Brev- og tekstbibliotek" })).toBeDefined();
  });

  it("blander ikke søkesiden med en sak", () => {
    visPaa("/sok");

    expect(screen.getByRole("link", { name: "Brev- og tekstbibliotek" })).toBeDefined();
  });

  // Popoveren rendres som søsken inne i den samme wrapperen som styler trigger-knappen
  // hvit mot den mørke topplinja. Treffer den stylingen bredere enn verktøylinja, blir
  // knappene inne i popoveren hvite på hvit bakgrunn – lesbare for DOM-en, usynlige for
  // brukeren. Testen holder popoverinnholdet utenfor det stylede omfanget.
  it("lar ikke topplinje-stylingen nå knappene inne i popoveren", async () => {
    vi.mocked(useTekstblokker).mockReturnValue({
      data: [tekstblokkOversikt({ id: 1, tittel: "Om utsending" })],
      isLoading: false,
    } as ReturnType<typeof useTekstblokker>);
    visPaa("/EU_EOS/saksbehandling/2024-123");

    await userEvent.click(screen.getByRole("button", { name: "Brev- og tekstbibliotek" }));

    const stylet = ".topplinje__bibliotek .tekstblokkSoek__verktoylinje";
    expect(screen.getByRole("button", { name: "Brev- og tekstbibliotek" }).closest(stylet)).not.toBeNull();
    expect(screen.getByRole("button", { name: "Vis innhold" }).closest(stylet)).toBeNull();
    expect(screen.getByRole("button", { name: "Lukk" }).closest(stylet)).toBeNull();
  });

  it("er borte når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    const { container } = visPaa("/");

    expect(container.textContent).toBe("");
  });
});
