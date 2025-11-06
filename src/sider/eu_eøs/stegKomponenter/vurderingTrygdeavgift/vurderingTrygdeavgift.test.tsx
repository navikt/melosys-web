import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../../melosyskodeverk";
import { VurderingTrygdeavgift } from "./vurderingTrygdeavgift";

// Mock API-kall
vi.mock("../../../../services/api", () => ({
  Trygdeavgift: {
    hentBeregnetTrygdeavgiftEosPensjonist: vi.fn(() =>
      Promise.resolve({
        trygdeavgiftsperioder: [],
        trygdeavgiftsgrunnlag: {
          skatteforholdsperioder: [],
          inntektskilder: [],
        },
      }),
    ),
    hentOpprinneligTrygdeavgiftsgrunnlag: vi.fn(() =>
      Promise.resolve({
        skatteforholdsperioder: [],
        inntektskilder: [],
      }),
    ),
    beregnTrygdeavgiftsperioder: vi.fn(() =>
      Promise.resolve({
        trygdeavgiftsperioder: [],
        trygdeavgiftsgrunnlag: {
          skatteforholdsperioder: [],
          inntektskilder: [],
        },
      }),
    ),
    lagreTrygdeavgiftsperioder: vi.fn(() => Promise.resolve()),
  },
}));

describe("VurderingTrygdeavgift", () => {
  const defaultProps = {
    bekreft: vi.fn(),
    tilbake: vi.fn(),
    aktivtSteg: true,
    oppdaterStatus: vi.fn(),
  };

  const initialStore = {
    behandlinger: {
      data: {
        behandlingID: 123,
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY,
        behandlingstema: MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
      },
    },
    lovvalgsperioder: {
      fomDato: "2024-01-01",
      tomDato: "2024-12-31",
    },
    helseutgiftdekkesperiode: {
      data: {
        fomDato: "2024-01-01",
        tomDato: "2024-12-31",
      },
    },
    fagsaker: {
      data: {
        sakstype: MKV.Koder.sakstyper.EU_EOS,
      },
    },
    redigerbart: {
      data: true,
    },
    featureToggles: {
      data: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("grunnleggende rendering", () => {
    it("skal rendre komponenten uten feil", () => {
      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: initialStore,
      });

      // Komponenten skal rendre uten å krasje
      expect(screen.getByText("Bekreft og fortsett")).toBeInTheDocument();
      expect(screen.getByText("Tilbake")).toBeInTheDocument();
    });

    it("skal vise stegknapper", () => {
      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: initialStore,
      });

      expect(screen.getByRole("button", { name: /bekreft og fortsett/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /tilbake/i })).toBeInTheDocument();
    });
  });

  describe("conditional rendering basert på behandlingstype", () => {
    it("skal håndtere NY_VURDERING behandlingstype", () => {
      const storeWithNyVurdering = {
        ...initialStore,
        behandlinger: {
          data: {
            ...initialStore.behandlinger.data,
            behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
          },
        },
      };

      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: storeWithNyVurdering,
      });

      // Komponenten skal rendre for NY_VURDERING
      expect(screen.getByText("Bekreft og fortsett")).toBeInTheDocument();
    });

    it("skal håndtere MANGLENDE_INNBETALING_TRYGDEAVGIFT behandlingstype", () => {
      const storeWithManglendeInnbetaling = {
        ...initialStore,
        behandlinger: {
          data: {
            ...initialStore.behandlinger.data,
            behandlingstype: MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT,
          },
        },
      };

      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: storeWithManglendeInnbetaling,
      });

      // Komponenten skal rendre for MANGLENDE_INNBETALING_TRYGDEAVGIFT
      expect(screen.getByText("Bekreft og fortsett")).toBeInTheDocument();
    });
  });

  describe("EØS Pensjonist spesifikk funksjonalitet", () => {
    it("skal vise komponenten for EØS pensjonist", () => {
      const storeWithEosPensjonist = {
        ...initialStore,
        fagsaker: {
          data: {
            sakstype: MKV.Koder.sakstyper.EU_EOS,
          },
        },
        behandlinger: {
          data: {
            ...initialStore.behandlinger.data,
            behandlingstema: MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
          },
        },
      };

      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: storeWithEosPensjonist,
      });

      expect(screen.getByText("Bekreft og fortsett")).toBeInTheDocument();
    });
  });

  describe("knapp disabled state", () => {
    it("skal disable bekreft knapp når komponenten ikke er redigerbar", () => {
      const storeWithIkkeRedigerbart = {
        ...initialStore,
        redigerbart: {
          data: false,
        },
      };

      renderWithProviders(<VurderingTrygdeavgift {...defaultProps} />, {
        preloadedState: storeWithIkkeRedigerbart,
      });

      const bekreftKnapp = screen.getByRole("button", { name: /bekreft og fortsett/i });
      expect(bekreftKnapp).toBeDisabled();
    });
  });
});
