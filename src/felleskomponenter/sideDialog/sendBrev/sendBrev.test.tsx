import { waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import SendBrev from "./sendBrev";
import * as Api from "../../../services/api";

// Mock API calls
vi.mock("../../../services/api", () => ({
  Behandling: {
    behandling: {
      hentMaler: vi.fn().mockResolvedValue([]),
      hentMottakere: vi.fn().mockResolvedValue([]),
    },
  },
  Dokumenter: {
    dokumenter: {
      hent: vi.fn().mockResolvedValue([]),
      opprettFritekst: vi.fn().mockResolvedValue({ dokumentID: "123" }),
    },
  },
  DokumenterV2: {
    dokumenter: {
      hent: vi.fn().mockResolvedValue([]),
    },
    hentTilgjengeligeMaler: vi.fn().mockResolvedValue([]),
    hentTilgjengeligeStandardvedlegg: vi.fn().mockResolvedValue([]),
    hentMuligeMottakereNorskMyndighet: vi.fn().mockResolvedValue({ mottakere: [], kopiMottakere: [] }),
    hentMuligeMottakere: vi.fn().mockResolvedValue({ mottakere: [], kopiMottakere: [] }),
    opprettBrev: vi.fn().mockResolvedValue({}),
    konverterMuligMottakerTilKopiMottaker: vi.fn((m) => m),
  },
  Brev: {
    brev: {
      sendBrev: vi.fn().mockResolvedValue({}),
      lagreUtkast: vi.fn().mockResolvedValue({}),
    },
  },
  Brevutkast: {
    hentBrevutkast: vi.fn().mockResolvedValue([]),
    slettBrevutkast: vi.fn().mockResolvedValue({}),
    lagreBrevutkast: vi.fn().mockResolvedValue({}),
    oppdaterBrevutkast: vi.fn().mockResolvedValue({}),
  },
}));

// BrevValgMedPlaceholdere kaller useQuery uansett toggle-status, og renderWithProviders
// setter ikke opp noen QueryClient.
vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderVerdier: () => ({ data: undefined }),
  usePlaceholderKatalog: () => ({ data: undefined }),
}));

// Mock child components
vi.mock("./brevMottaker", () => ({
  default: () => <div>BrevMottaker Mock</div>,
}));

vi.mock("./brevValg", () => ({
  default: () => <div>BrevValg Mock</div>,
}));

vi.mock("./brevutkast", () => ({
  default: () => <div>Brevutkast Mock</div>,
}));

vi.mock("./vedlegg", () => ({
  default: () => <div>Vedlegg Mock</div>,
}));

vi.mock("./fritekstVedlegg", () => ({
  default: () => <div>FritekstVedlegg Mock</div>,
}));

vi.mock("../../alertmeldinger", async () => {
  const actual = await vi.importActual("../../alertmeldinger");
  return {
    ...actual,
  };
});

describe("SendBrev", () => {
  const defaultPreloadedState = {
    form: {
      SEND_BREV: {
        values: {},
      },
    },
    behandlinger: {
      data: [
        {
          behandlingID: 123,
          saksnummer: "12345678",
        },
      ],
    },
    dokumenter: { data: [] },
  };

  const defaultProps = {
    behandlingID: 123,
    redigerbart: true,
    dokumenter: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal returnere null før async data er lastet", async () => {
    const { container } = renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    // Komponenten returnerer null mens den venter på API-data
    await waitFor(() => {
      expect(container.querySelector(".send_brev")).not.toBeInTheDocument();
    });
  });

  it("skal kalle API for å hente tilgjengelige maler ved mount", async () => {
    renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(Api.DokumenterV2.hentTilgjengeligeMaler).toHaveBeenCalledWith(123);
    });
  });

  it("skal kalle API for å hente standardvedlegg ved mount", async () => {
    renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(Api.DokumenterV2.hentTilgjengeligeStandardvedlegg).toHaveBeenCalled();
    });
  });

  it("skal kalle API for å hente brevutkast ved mount", async () => {
    renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(Api.Brevutkast.hentBrevutkast).toHaveBeenCalledWith(123);
    });
  });

  it("skal håndtere ulike behandlingsIDer", async () => {
    const props = {
      ...defaultProps,
      behandlingID: 999,
    };

    renderWithProviders(<SendBrev {...props} />, {
      preloadedState: defaultPreloadedState,
    });

    await waitFor(() => {
      expect(Api.DokumenterV2.hentTilgjengeligeMaler).toHaveBeenCalledWith(999);
    });
  });

  it("skal håndtere tomme behandlinger i state", async () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [],
      },
    };

    const { container } = renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState,
    });

    await waitFor(() => {
      expect(container.querySelector(".send_brev")).not.toBeInTheDocument();
    });
  });

  it("skal håndtere dokumenter i state", async () => {
    const preloadedState = {
      ...defaultPreloadedState,
      dokumenter: {
        data: [
          { dokumentID: "1", tittel: "Test dokument" },
          { dokumentID: "2", tittel: "Test dokument 2" },
        ],
      },
    };

    renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState,
    });

    // Komponenten rendrer uten å krasje - vent på at async operasjoner stabiliserer seg
    await waitFor(() => {
      expect(true).toBe(true);
    });
  });

  it("skal ikke krasje ved rendering", async () => {
    renderWithProviders(<SendBrev {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    // Vent på at async operasjoner stabiliserer seg
    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});
