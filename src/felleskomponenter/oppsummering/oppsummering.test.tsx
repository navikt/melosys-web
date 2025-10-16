import { vi } from "vitest";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import Oppsummering from "./oppsummering";
import MKV from "../../melosyskodeverk";

// Mock API calls
vi.mock("../../services/api", () => ({
  Behandlinger: {
    aarsak: {
      hentMottaksdato: vi.fn().mockResolvedValue("2024-01-15"),
    },
  },
  Fagsaker: {
    fagsak: {
      hentTrygdeavgiftOppsummering: vi.fn().mockResolvedValue({ harBehandlingMedTrygdeavgift: false }),
    },
  },
}));

// Mock child components
vi.mock("./verdiPar/oppsummeringVerdiPar", () => ({
  default: ({ nokkel, verdi }: any) => (
    <div data-testid="verdi-par">
      <span>{nokkel}</span>: <span>{verdi}</span>
    </div>
  ),
}));

vi.mock("./endreBehandlingModal", () => ({
  default: ({ skalViseModal, lukkModal }: any) =>
    skalViseModal ? (
      <div data-testid="endre-modal">
        EndreBehandlingModal Mock<button onClick={lukkModal}>Lukk</button>
      </div>
    ) : null,
}));

vi.mock("../behandlingsstatus", () => ({
  BehandlingsstatusMedSvarfrist: ({ behandlingsstatus }: any) => <div>{behandlingsstatus.term}</div>,
}));

vi.mock("../kopierbarTekst", () => ({
  default: ({ children }: any) => <div data-testid="kopierbar-tekst">{children}</div>,
}));

// Mock hooks
vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: vi.fn().mockReturnValue(false),
}));

vi.mock("../../url", () => ({
  harIkkeYrkesaktivFlyt: vi.fn().mockReturnValue(false),
  harUnntaksregistreringFlyt: vi.fn().mockReturnValue(false),
  skalViseIngenFlyt: vi.fn().mockReturnValue(false),
}));

describe("Oppsummering", () => {
  const defaultFagsak = {
    saksnummer: "12345678",
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    sakstema: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
    hovedpartRolle: MKV.Koder.aktoersroller.BRUKER,
    registrertDato: "2024-01-01",
  };

  const defaultOppsummering = {
    endretDato: "2024-01-20",
    endretAvNavn: "Test Saksbehandler",
    svarFrist: null,
    behandlingstype: MKV.Koder.behandlinger.behandlingstyper.UTSENDING_ARTIKKEL_17,
    behandlingsfrist: "2024-02-01",
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDELSE,
    behandlingsstatus: MKV.Koder.behandlinger.behandlingsstatus.APEN,
    behandlingsresultattype: { term: "Innvilget" },
    registrertDato: "2024-01-15",
  };

  const defaultPreloadedState = {
    fagsaker: {
      data: defaultFagsak,
    },
    behandlinger: {
      data: [
        {
          behandlingID: "123",
          ...defaultOppsummering,
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal returnere tom div når fagsak er tom", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      fagsaker: {
        data: null,
      },
    };

    const { container } = renderWithProviders(<Oppsummering />, {
      preloadedState,
    });

    expect(container.querySelector("section")).not.toBeInTheDocument();
  });

  it("skal returnere tom div når oppsummering er tom", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [],
      },
    };

    const { container } = renderWithProviders(<Oppsummering />, {
      preloadedState,
    });

    expect(container.querySelector("section")).not.toBeInTheDocument();
  });

  it("skal ikke krasje ved rendering med minimal state", () => {
    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere arbeidsland prop", () => {
    const arbeidsland = [
      { kode: "SE", term: "sverige" },
      { kode: "DK", term: "danmark" },
    ];

    expect(() => {
      renderWithProviders(<Oppsummering arbeidsland={arbeidsland} />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere lovvalgsperiode props", () => {
    expect(() => {
      renderWithProviders(<Oppsummering lovvalgsperiodeFom="2024-01-01" lovvalgsperiodeTom="2024-12-31" />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere avsenderland prop", () => {
    const avsenderland = { kode: "SE", term: "sverige" };

    expect(() => {
      renderWithProviders(<Oppsummering avsenderland={avsenderland} />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere lovvalgsland prop", () => {
    const lovvalgsland = { kode: "SE", term: "sverige" };

    expect(() => {
      renderWithProviders(<Oppsummering lovvalgsland={lovvalgsland} />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere bostedsland prop", () => {
    const bostedsland = { kode: "NO", term: "norge" };

    expect(() => {
      renderWithProviders(<Oppsummering bostedsland={bostedsland} />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere medlemskapsperiode props", () => {
    expect(() => {
      renderWithProviders(<Oppsummering medlemskapsperiodeFom="2024-01-01" medlemskapsperiodeTom="2024-12-31" />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere mottatteOpplysningerPeriode props", () => {
    expect(() => {
      renderWithProviders(
        <Oppsummering mottatteOpplysningerPeriodeFom="2024-01-01" mottatteOpplysningerPeriodeTom="2024-12-31" />,
        {
          preloadedState: defaultPreloadedState,
        },
      );
    }).not.toThrow();
  });

  it("skal håndtere helseDekkesPeriode props", () => {
    expect(() => {
      renderWithProviders(<Oppsummering helseDekkesPeriodeFom="2024-01-01" helseDekkesPeriodeTom="2024-12-31" />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere custom className prop", () => {
    expect(() => {
      renderWithProviders(<Oppsummering className="custom-class" />, {
        preloadedState: defaultPreloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere TRYGDEAVTALE sakstype", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      fagsaker: {
        data: {
          ...defaultFagsak,
          sakstype: MKV.Koder.sakstyper.TRYGDEAVTALE,
        },
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere FTRL sakstype", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      fagsaker: {
        data: {
          ...defaultFagsak,
          sakstype: MKV.Koder.sakstyper.FTRL,
        },
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere årsavregning behandlingstype", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            behandlingstype: MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere virksomhet som hovedpart", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      fagsaker: {
        data: {
          ...defaultFagsak,
          hovedpartRolle: MKV.Koder.aktoersroller.VIRKSOMHET,
        },
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere avsluttet behandlingsstatus", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            behandlingsstatus: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere midlertidig lovvalgsbeslutning status", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            behandlingsstatus: MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING,
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere iverksetter vedtak status", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            behandlingsstatus: MKV.Koder.behandlinger.behandlingsstatus.IVERKSETTER_VEDTAK,
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere behandling uten behandlingsresultattype", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            behandlingsresultattype: null,
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });

  it("skal håndtere behandling med svarfrist", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: {
        data: [
          {
            behandlingID: "123",
            ...defaultOppsummering,
            svarFrist: "2024-03-01",
          },
        ],
      },
    };

    expect(() => {
      renderWithProviders(<Oppsummering />, {
        preloadedState,
      });
    }).not.toThrow();
  });
});
