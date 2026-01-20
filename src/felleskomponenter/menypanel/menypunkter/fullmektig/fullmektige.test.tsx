import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import Fullmektige from "./fullmektige";

// Mock API
vi.mock("../../../../services/api", () => ({
  Fagsaker: {
    aktoer: {
      hent: vi.fn().mockResolvedValue([]),
      send: vi.fn().mockResolvedValue({}),
      slett: vi.fn().mockResolvedValue({}),
    },
    kontaktopplysninger: {
      hent: vi.fn().mockResolvedValue({}),
      send: vi.fn().mockResolvedValue({}),
      slett: vi.fn().mockResolvedValue({}),
    },
    fagsak: {
      hentTrygdeavgiftOppsummering: vi.fn().mockResolvedValue({ harBehandlingMedTrygdeavgift: false }),
    },
  },
}));

// Mock child components
vi.mock("./lagretFullmektig", () => ({
  default: ({ fullmektige }: any) => <div>LagretFullmektig Mock - {fullmektige.length} fullmektige</div>,
}));

vi.mock("./redigererFullmektig", () => ({
  default: () => <div>RedigererFullmektig Mock</div>,
}));

vi.mock("../../../knapperad", () => ({
  default: ({ bekreft, avbryt }: any) => (
    <div>
      <button onClick={bekreft}>Bekreft</button>
      <button onClick={avbryt}>Avbryt</button>
    </div>
  ),
}));

describe("Fullmektige", () => {
  const mockFinnOrganisasjonAdresse = vi.fn().mockResolvedValue({ adresse: "Test adresse", feil: null });
  const mockFinnPersonAdresse = vi.fn().mockResolvedValue({ adresse: "Person adresse", feil: null });

  const defaultProps = {
    redigerbart: true,
    finnOrganisasjonAdresse: mockFinnOrganisasjonAdresse,
    finnPersonAdresse: mockFinnPersonAdresse,
  };

  const defaultPreloadedState = {
    fagsaker: {
      data: {
        saksnummer: "12345678",
      },
    },
    behandlinger: {
      data: [
        {
          behandlingstype: "UTSENDING",
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre komponenten", async () => {
    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText(/Ingen fullmektig registrert/i)).toBeInTheDocument();
    });
  });

  it("skal vise 'Ingen fullmektig registrert' når ingen er registrert", async () => {
    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText(/Ingen fullmektig registrert/i)).toBeInTheDocument();
    });
  });

  it("skal vise 'Legg til ny fullmektig' knapp når redigerbart og ingen fullmektige", async () => {
    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText(/Legg til ny fullmektig/i)).toBeInTheDocument();
    });
  });

  it("skal ikke vise 'Legg til ny fullmektig' knapp når ikke redigerbart", async () => {
    renderWithProviders(<Fullmektige {...defaultProps} redigerbart={false} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(screen.queryByText(/Legg til ny fullmektig/i)).not.toBeInTheDocument();
    });
  });

  it("skal ha CSS-klasse fullmektige", async () => {
    const { container } = renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(container.querySelector(".fullmektige")).toBeInTheDocument();
    });
  });

  it("skal håndtere ulike saksnumre", async () => {
    const preloadedState = {
      ...defaultPreloadedState,
      fagsaker: {
        data: {
          saksnummer: "87654321",
        },
      },
    };

    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText(/Ingen fullmektig registrert/i)).toBeInTheDocument();
    });
  });

  it("skal kalle API for å hente fullmektige ved mount", async () => {
    const Api = await import("../../../../services/api");

    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(Api.Fagsaker.aktoer.hent).toHaveBeenCalledWith("12345678", "FULLMEKTIG");
    });
  });

  it("skal håndtere ulike behandlingstyper", async () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingstype: "HENVENDELSE",
          },
        ],
      },
    };

    renderWithProviders(<Fullmektige {...defaultProps} />, {
      preloadedState,
    });

    await waitFor(() => {
      expect(screen.getByText(/Ingen fullmektig registrert/i)).toBeInTheDocument();
    });
  });
});
