import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import OpprettNySakForm from "./opprettnysak";

// Mock API calls
vi.mock("../../services/api", () => ({
  Fagsaker: {
    fagsak: {
      opprett: vi.fn(),
    },
  },
  Kodeverk: {
    hentLandkoderIso2: vi.fn().mockResolvedValue([]),
  },
}));

// Mock GraphQL navn fetch
vi.mock("../../graphql/navn", () => ({
  hentSammensattNavn: vi.fn().mockResolvedValue("Test Testesen"),
}));

describe("OpprettNySak", () => {
  const mockTilForsiden = vi.fn();

  const defaultPreloadedState = {
    form: {},
    sok: { data: [] },
    landkoder: { data: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre komponenten", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText("Hvem skal saken opprettes på?")).toBeInTheDocument();
    });
  });

  it("skal vise bruker-felter som standard", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText("Bruker")).toBeInTheDocument();
      expect(screen.getByText("Virksomhet")).toBeInTheDocument();

      // Bruker skal være valgt som standard
      const brukerRadio = screen.getByRole("radio", { name: "Bruker" });
      expect(brukerRadio).toBeChecked();
    });
  });

  it("skal vise virksomhet-felter når virksomhet velges", async () => {
    const user = userEvent.setup();

    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    const virksomhetRadio = screen.getByRole("radio", { name: "Virksomhet" });
    await user.click(virksomhetRadio);

    await waitFor(() => {
      expect(virksomhetRadio).toBeChecked();
    });
  });

  it("skal vise avbryt-knapp", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText("Avbryt")).toBeInTheDocument();
    });
  });

  it("skal kalle tilForsiden når avbryt klikkes", async () => {
    const user = userEvent.setup();

    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    const avbrytKnapp = screen.getByText("Avbryt");
    await user.click(avbrytKnapp);

    expect(mockTilForsiden).toHaveBeenCalledTimes(1);
  });

  it("skal vise checkbox for 'Legg behandlingen i mine oppgaver'", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText("Legg behandlingen i mine oppgaver")).toBeInTheDocument();
    });
  });

  it("skal vise opprett-knapp", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText("Opprett ny behandling")).toBeInTheDocument();
    });
  });

  it("skal ikke vise fagsakvelger før bruker/virksomhet info er fylt ut", async () => {
    renderWithProviders(<OpprettNySakForm tilForsiden={mockTilForsiden} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.queryByText("Knytt til eksisterende sak eller opprett ny")).not.toBeInTheDocument();
    });
  });
});
