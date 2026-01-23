import { describe, it, expect, vi, beforeEach } from "vitest";
import { VurderingVedtak } from "./vurderingVedtak";
import { renderWithProvidersAsync } from "../../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";

Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Mock only the API calls to prevent network requests
vi.mock("../../../../services/api", () => ({
  Aarsavregning: {
    hentAarsavregning: vi.fn(),
  },
  DokumenterV2: {
    hentMuligeMottakere: vi.fn(),
    hentStandardvedleggForBrev: vi.fn(),
    tomHentMuligeMottakereResDto: () => ({
      hovedMottaker: null,
      kopiMottakere: [],
      fasteMottakere: [],
    }),
    konverterMuligMottakerTilKopiMottaker: vi.fn(),
  },
  Trygdeavgift: {
    hentFakturamottaker: vi.fn(),
  },
  Fagsaker: {
    aktoer: {
      hent: vi.fn(),
    },
  },
  Behandlinger: {
    resultat: {
      oppdaterFritekster: vi.fn(),
    },
  },
}));

const { BEREGNET_AVGIFT } = MKV.Koder.endeligAvgiftValg;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;

describe("VurderingVedtak", () => {
  beforeEach(() => {
    // Setup realistic API mock responses
    const mockAarsavregningResponse = {
      aarsavregningID: 12345,
      aar: 2024,
      endeligAvgiftValg: BEREGNET_AVGIFT,
      avregning: {
        tidligereFakturertBeloep: 25000,
        trygdeavgiftFraAvgiftssystemet: 30000,
        beregnetAvgiftBelop: 28000,
        manueltAvgiftBeloep: undefined,
      },
      harTrygdeavgiftFraAvgiftssystemet: true,
      sisteGjeldendeAvgiftspliktigperioder: [],
      tidligereTrygdeavgiftsGrunnlagsopplysninger: {
        trygdeavgiftsgrunnlag: {
          avgiftspliktigperioder: [],
          skatteforholdsperioder: [],
          inntektskperioder: [],
        },
        avgift: {
          trygdeavgiftsperioder: [],
          totalInntekt: 500000,
          totalAvgift: 27000,
        },
        tidligereTrygdeavgiftFraAvgiftssystemet: 27000,
      },
    };

    const mockMuligeMottakere = {
      hovedMottaker: {
        rolle: "SØKER",
        mottakerNavn: "Ola Nordmann",
        dokumentNavn: "Vedtak årsavregning 2024",
        orgnr: null,
        aktørId: "123456789",
        institusjonID: null,
      },
      kopiMottakere: [
        {
          rolle: "ARBEIDSGIVER",
          mottakerNavn: "Acme AS",
          dokumentNavn: "Kopi av vedtak årsavregning 2024",
          orgnr: "123456789",
          aktørId: null,
          institusjonID: null,
        },
      ],
      fasteMottakere: [],
    };

    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(mockAarsavregningResponse);
    vi.mocked(Api.DokumenterV2.hentMuligeMottakere).mockResolvedValue(mockMuligeMottakere);
    vi.mocked(Api.DokumenterV2.hentStandardvedleggForBrev).mockResolvedValue([
      {
        dokumentId: "vedlegg1",
        dokumentNavn: "Informasjon om trygdeavgift",
        erValgt: true,
      },
    ]);
    vi.mocked(Api.Trygdeavgift.hentFakturamottaker).mockResolvedValue({
      navn: "Acme AS",
    });
    vi.mocked(Api.Fagsaker.aktoer.hent).mockResolvedValue([
      {
        aktoerID: "aktør123",
        rolleKode: "FULLMEKTIG",
        fullmakter: [FULLMEKTIG_TRYGDEAVGIFT],
      },
    ]);
    vi.mocked(Api.Behandlinger.resultat.oppdaterFritekster).mockResolvedValue({});
  });

  it("should render snapshot with realistic data", async () => {
    const mockProps = {
      tilbake: vi.fn(),
      aktivtSteg: true,
    };

    // Create proper Redux state structure
    const initialReduxState = {
      behandlinger: {
        status: "OK",
        data: {
          behandlingID: 12345,
          redigerbart: true, // This is where redigerbart is actually stored
        },
      },
      menypanel: {
        status: "OK",
        data: {
          erFullmektigEndret: false,
        },
      },
      fagsaker: {
        status: "OK",
        data: {
          saksnummer: "SAK123456",
        },
      },
      behandlingsresultat: {
        status: "OK",
        data: {
          innledningFritekst: "Dette er en innledning til vedtaket om årsavregning for 2024.",
          begrunnelseFritekst: "Basert på innsendte opplysninger er trygdeavgiften fastsatt til kr 28.000.",
        },
      },
      aarsavregning: {
        status: "OK",
        data: {},
        erNyVurdering: false,
      },
    };

    const { container } = await renderWithProvidersAsync(<VurderingVedtak {...mockProps} />, {
      preloadedState: initialReduxState,
    });

    // Wait for async operations to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(container).toMatchSnapshot();
  });
});

/**
 * MELOSYS-7114: Obligatorisk begrunnelse ved ny årsavregning
 *
 * Akseptansekriterier:
 * - AK1: Førstegangsbehandling uten manuell avgift → Begrunnelse IKKE obligatorisk
 * - AK2: Førstegangsbehandling med manuell avgift → Begrunnelse obligatorisk
 * - AK3: Ny vurdering uten manuell avgift → Begrunnelse obligatorisk (§ 12-1)
 * - AK4: Ny vurdering med manuell avgift → Begrunnelse obligatorisk (begge grunner)
 */
import { screen, waitFor } from "@testing-library/react";

const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

describe("MELOSYS-7114: Obligatorisk begrunnelse", () => {
  const createReduxState = (erNyVurdering = false) => ({
    behandlinger: {
      status: "OK",
      data: {
        behandlingID: 12345,
        redigerbart: true,
      },
    },
    menypanel: {
      status: "OK",
      data: {
        erFullmektigEndret: false,
      },
    },
    fagsaker: {
      status: "OK",
      data: {
        saksnummer: "SAK123456",
      },
    },
    behandlingsresultat: {
      status: "OK",
      data: {
        innledningFritekst: "",
        begrunnelseFritekst: "",
      },
    },
    aarsavregning: {
      status: "OK",
      data: {},
      erNyVurdering,
    },
  });

  const defaultReduxState = createReduxState(false);

  const defaultMockProps = {
    tilbake: vi.fn(),
    aktivtSteg: true,
  };

  const createMockAarsavregningResponse = (overrides = {}) => ({
    aarsavregningID: 12345,
    aar: 2024,
    endeligAvgiftValg: BEREGNET_AVGIFT,
    avregning: {
      tidligereFakturertBeloep: 25000,
      trygdeavgiftFraAvgiftssystemet: undefined,
      beregnetAvgiftBelop: 28000,
      manueltAvgiftBeloep: undefined,
    },
    harTrygdeavgiftFraAvgiftssystemet: false,
    sisteGjeldendeAvgiftspliktigperioder: [],
    tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
    ...overrides,
  });

  const setupMocks = (aarsavregningOverrides = {}) => {
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(
      createMockAarsavregningResponse(aarsavregningOverrides),
    );
    vi.mocked(Api.DokumenterV2.hentMuligeMottakere).mockResolvedValue({
      hovedMottaker: {
        rolle: "SØKER",
        mottakerNavn: "Ola Nordmann",
        dokumentNavn: "Vedtak årsavregning 2024",
        orgnr: null,
        aktørId: "123456789",
        institusjonID: null,
      },
      kopiMottakere: [],
      fasteMottakere: [],
    });
    vi.mocked(Api.DokumenterV2.hentStandardvedleggForBrev).mockResolvedValue([]);
    vi.mocked(Api.Trygdeavgift.hentFakturamottaker).mockResolvedValue({ navn: "Acme AS" });
    vi.mocked(Api.Fagsaker.aktoer.hent).mockResolvedValue([]);
    vi.mocked(Api.Behandlinger.resultat.oppdaterFritekster).mockResolvedValue({});
  };

  describe("AK1: Førstegangsbehandling uten manuell avgift", () => {
    beforeEach(() => {
      setupMocks({ endeligAvgiftValg: BEREGNET_AVGIFT });
    });

    it("skal IKKE vise varsel når det er førstegangsbehandling uten manuell avgift", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: defaultReduxState,
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Skal IKKE vise varsel
      expect(screen.queryByText(/Følgende punkter må begrunnes/)).not.toBeInTheDocument();
      expect(screen.queryByText(/skatteforvaltningsloven § 12-1/)).not.toBeInTheDocument();
    });

    it("skal IKKE vise (Obligatorisk) i label", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: defaultReduxState,
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Label skal IKKE ha "(Obligatorisk)"
      expect(screen.queryByText(/Fritekst til begrunnelse \(Obligatorisk\)/)).not.toBeInTheDocument();
      expect(screen.getByText(/Fritekst til begrunnelse/)).toBeInTheDocument();
    });
  });

  describe("AK2: Førstegangsbehandling med manuell avgift", () => {
    beforeEach(() => {
      setupMocks({ endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT });
    });

    it("skal vise varsel om manuell avgift", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: defaultReduxState,
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Skal vise varsel om manuell avgift
      await waitFor(() => {
        expect(screen.getByText(/Følgende punkter må begrunnes/)).toBeInTheDocument();
        expect(screen.getByText(/hvorfor du har lagt inn «Endelig beregnet trygdeavgift» manuelt/)).toBeInTheDocument();
      });
    });

    it("skal vise (Obligatorisk) i label", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: defaultReduxState,
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Label skal ha "(Obligatorisk)"
      await waitFor(() => {
        expect(screen.getByText(/Fritekst til begrunnelse \(Obligatorisk\)/)).toBeInTheDocument();
      });
    });
  });

  describe("AK3: Ny vurdering uten manuell avgift", () => {
    beforeEach(() => {
      setupMocks({ endeligAvgiftValg: BEREGNET_AVGIFT });
    });

    it("skal vise varsel om § 12-1", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: createReduxState(true),
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Skal vise varsel om § 12-1
      await waitFor(() => {
        expect(screen.getByText(/Følgende punkter må begrunnes/)).toBeInTheDocument();
        expect(
          screen.getByText(
            /hvorfor fastsettelsen av trygdeavgiften tas opp igjen etter skatteforvaltningsloven § 12-1/,
          ),
        ).toBeInTheDocument();
      });
    });

    it("skal vise (Obligatorisk) i label", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: createReduxState(true),
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Label skal ha "(Obligatorisk)"
      await waitFor(() => {
        expect(screen.getByText(/Fritekst til begrunnelse \(Obligatorisk\)/)).toBeInTheDocument();
      });
    });
  });

  describe("AK4: Ny vurdering med manuell avgift", () => {
    beforeEach(() => {
      setupMocks({ endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT });
    });

    it("skal vise varsel med BEGGE punktene", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: createReduxState(true),
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Skal vise begge varseltekster
      await waitFor(() => {
        expect(screen.getByText(/Følgende punkter må begrunnes/)).toBeInTheDocument();
        expect(
          screen.getByText(
            /hvorfor fastsettelsen av trygdeavgiften tas opp igjen etter skatteforvaltningsloven § 12-1/,
          ),
        ).toBeInTheDocument();
        expect(screen.getByText(/hvorfor du har lagt inn «Endelig beregnet trygdeavgift» manuelt/)).toBeInTheDocument();
      });
    });

    it("skal vise (Obligatorisk) i label", async () => {
      await renderWithProvidersAsync(<VurderingVedtak {...defaultMockProps} />, {
        preloadedState: createReduxState(true),
      });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Vedtak årsavregning/ })).toBeInTheDocument();
      });

      // Label skal ha "(Obligatorisk)"
      await waitFor(() => {
        expect(screen.getByText(/Fritekst til begrunnelse \(Obligatorisk\)/)).toBeInTheDocument();
      });
    });
  });
});
