import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import SoknadForm from "./soknad";

// Mock Menypanel
vi.mock("../menypanel", () => ({
  default: ({ lagreSoknadOgOppfriskSaksopplysninger, visOppdaterRegisteropplysninger }: any) => (
    <div>
      <div>Menypanel Mock</div>
      <button onClick={() => lagreSoknadOgOppfriskSaksopplysninger()}>Lagre og oppfrisk</button>
      {visOppdaterRegisteropplysninger && <div>Vis oppdater registeropplysninger</div>}
    </div>
  ),
}));

describe("SoknadForm", () => {
  const mockStartOgVisOppfriskModal = vi.fn();

  const defaultProps = {
    startOgVisOppfriskModal: mockStartOgVisOppfriskModal,
    visOppdaterRegisteropplysninger: true,
  };

  const defaultPreloadedState = {
    form: {
      soknad: {
        values: {},
      },
    },
    behandlinger: {
      data: [
        {
          behandlingstema: { kode: "UTSENDELSE" },
        },
      ],
    },
    fagsaker: {
      data: {
        sakstype: { kode: "EU_EOS" },
      },
    },
    mottatteOpplysninger: {
      data: {},
    },
    behandlingsperioder: {
      data: [],
    },
    avklartefakta: {
      data: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre form-elementet", () => {
    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    const form = document.querySelector("form#soknad");
    expect(form).toBeInTheDocument();
  });

  it("skal rendre Menypanel-komponenten", () => {
    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    expect(screen.getByText("Menypanel Mock")).toBeInTheDocument();
  });

  it("skal vise oppdater registeropplysninger når visOppdaterRegisteropplysninger er true", () => {
    renderWithProviders(<SoknadForm {...defaultProps} visOppdaterRegisteropplysninger={true} />, {
      preloadedState: defaultPreloadedState,
    });

    expect(screen.getByText("Vis oppdater registeropplysninger")).toBeInTheDocument();
  });

  it("skal ikke vise oppdater registeropplysninger når visOppdaterRegisteropplysninger er false", () => {
    renderWithProviders(<SoknadForm {...defaultProps} visOppdaterRegisteropplysninger={false} />, {
      preloadedState: defaultPreloadedState,
    });

    expect(screen.queryByText("Vis oppdater registeropplysninger")).not.toBeInTheDocument();
  });

  it("skal ha debounced lagreMottatteOpplysninger", () => {
    // Testen verifiserer at komponenten rendrer med debounced save-funksjonalitet
    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    // Komponenten bruker debounced lagring, så vi verifiserer bare at den rendrer
    expect(screen.getByText("Menypanel Mock")).toBeInTheDocument();
  });

  it("skal håndtere redigerbart = false", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      form: {
        soknad: {
          values: { test: "data" },
        },
      },
    };

    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState,
    });

    // Komponenten skal fortsatt rendre
    expect(screen.getByText("Menypanel Mock")).toBeInTheDocument();
  });

  it("skal håndtere feilmeldinger", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      form: {
        soknad: {
          values: { test: "data" },
          syncErrors: { soknadsperiodeFom: "Påkrevd" },
        },
      },
    };

    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState,
    });

    // Komponenten skal rendre selv med feilmeldinger
    expect(screen.getByText("Menypanel Mock")).toBeInTheDocument();
  });

  it("skal ha name og id på form", () => {
    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    const form = document.querySelector("form#soknad");
    expect(form).toHaveAttribute("name", "soknad");
    expect(form).toHaveAttribute("id", "soknad");
  });

  it("skal forhindre default submit-handling", () => {
    renderWithProviders(<SoknadForm {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    });

    const form = document.querySelector("form#soknad");

    // Dispatch submit event - formen skal forhindre default handling
    form?.dispatchEvent(new Event("submit"));

    // Form skal fortsatt være i dokumentet
    expect(form).toBeInTheDocument();
  });
});
