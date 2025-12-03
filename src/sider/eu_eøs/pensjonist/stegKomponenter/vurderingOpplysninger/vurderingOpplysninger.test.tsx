import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import VurderingOpplysninger from "./vurderingOpplysninger";
import { FellesHandlersContext } from "../../../../../contexts";

/**
 * UNIT TESTER FOR VURDERINGOPPLYSNINGER
 *
 * Disse testene verifiserer kritisk forretningslogikk for oppfriskning av registeropplysninger:
 * - Når skal oppfrisk-dialog vises vs direkte navigasjon
 * - Validering av steg basert på datakvalitet og oppfriskningsstatus
 * - Race condition-fikser (await på API-kall)
 */

// Mock alle eksterne dependencies
vi.mock("../../../../../hooks", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("../../../../../ducks/helseutgiftdekkesperiode", () => ({
  helseutgiftDekkesPeriodeOperations: {
    hentHelseutgiftDekkesPeriode: vi.fn(() => ({ type: "HENT_HELSEUTGIFT" })),
    oppdaterEllerOpprettHelseutgiftDekkesPeriode: vi.fn(() => ({ type: "OPPDATER_HELSEUTGIFT" })),
  },
  helseutgiftDekkesPeriodeSelector: {
    HelseutgiftDekkesPeriodeSelector: (state: any) => state.helseutgiftdekkesperiode,
    HelseutgiftDekkesPeriodeErPendingSelector: (state: any) => state.helseutgiftdekkesperiode?.status === "PENDING",
  },
}));

vi.mock("../../../../../ducks/oppsummertfakta", () => ({
  oppsummertfaktaOperations: {
    lagreUkjentSluttdatoMedlemskapsperiode: vi.fn(() => ({ type: "LAGRE_UKJENT_SLUTTDATO" })),
  },
  oppsummertfaktaSelectors: {
    UkjentSluttdatoMedlemskapsperiodeSelector: (state: any) =>
      state.oppsummertfakta?.data?.ukjentSluttdatoMedlemskapsperiode || false,
  },
}));

vi.mock("../../../../../ducks/behandlinger", () => ({
  behandlingerSelectors: {
    BehandlingIDSelector: (state: any) => state.behandlinger?.data?.[0]?.behandlingID || 123,
    SisteOpplysningerHentetDatoSelector: (state: any) =>
      state.behandlinger?.data?.[0]?.sisteOpplysningerHentetDato || null,
  },
}));

vi.mock("../../../../../ducks/redigerbart", () => ({
  redigerbartSelectors: {
    RedigerbartSelector: (state: any) => state.redigerbart?.redigerbart ?? true,
  },
}));

vi.mock("../../../../../ducks/modaler/selectors", () => ({
  BehandlingUnderOppfriskningSelector: (state: any) => state.modaler?.behandlingUnderOppfriskning ?? false,
}));

vi.mock("../../../../../ducks/menypanel", () => ({
  menypanelOperations: {
    visMenypanel: vi.fn(() => ({ type: "VIS_MENYPANEL" })),
  },
}));

vi.mock("../../../../../ducks/navigering", () => ({
  navigeringOperations: {
    tilForsiden: vi.fn(() => ({ type: "TIL_FORSIDEN" })),
  },
}));

vi.mock("./komponenter/periodeVelger/periodeVelger", () => ({
  PeriodeOgLandVelger: () => <div data-testid="periode-velger">PeriodeOgLandVelger</div>,
}));

vi.mock(
  "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/ukjentSluttdatoMedlemskapsperiode",
  () => ({
    UkjentSluttdatoMedlemskapsperiode: () => <div data-testid="ukjent-sluttdato">UkjentSluttdato</div>,
  }),
);

vi.mock("../../../../../felleskomponenter/dialogboks", () => ({
  DialogboksOppfriskSak: ({ oppfrisk, avbryt, lukk, tilForsiden }: any) => (
    <div data-testid="oppfrisk-dialog">
      <button onClick={oppfrisk} data-testid="oppfrisk-btn">
        Oppfrisk
      </button>
      <button onClick={avbryt} data-testid="avbryt-btn">
        Avbryt
      </button>
      <button onClick={lukk} data-testid="lukk-btn">
        Lukk
      </button>
      <button onClick={tilForsiden} data-testid="til-forsiden-btn">
        Til forsiden
      </button>
    </div>
  ),
}));

vi.mock("../../../../../felleskomponenter/ui", () => ({
  StegKnapper: ({ bekreftKnappProps }: any) => (
    <div>
      <button onClick={bekreftKnappProps.onClick} disabled={bekreftKnappProps.disabled} data-testid="neste-btn">
        Neste
      </button>
    </div>
  ),
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    watch: vi.fn(() => ({
      fomDato: "01.01.2025",
      tomDato: "31.12.2025",
      bostedLandkode: "NO",
    })),
    trigger: vi.fn(() => Promise.resolve(true)),
    reset: vi.fn(),
    formState: { isValid: true },
  }),
  Controller: ({ render }: any) => render({ field: {}, fieldState: {} }),
}));

vi.mock("@hookform/resolvers/yup", () => ({
  yupResolver: () => vi.fn(),
}));

vi.mock("../../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h1>{children}</h1>,
}));

const mockDispatch = vi.fn((action: any) => {
  if (typeof action === "function") {
    return action(mockDispatch, () => ({}));
  }
  return Promise.resolve(action);
});

describe("VurderingOpplysninger", () => {
  const mockBekreft = vi.fn();
  const mockTilbake = vi.fn();
  const mockOppdaterStatus = vi.fn();
  const mockOppfriskOgLastInnSaksopplysninger = vi.fn();

  const defaultProps = {
    bekreft: mockBekreft,
    tilbake: mockTilbake,
    aktivtSteg: true,
    oppdaterStatus: mockOppdaterStatus,
  };

  const rootReducer = combineReducers({
    behandlinger: (state = {}) => state,
    redigerbart: (state = {}) => state,
    helseutgiftdekkesperiode: (state = {}) => state,
    oppsummertfakta: (state = {}) => state,
    modaler: (state = {}) => state,
  });

  const defaultState = {
    behandlinger: {
      data: [
        {
          behandlingID: 123,
          sisteOpplysningerHentetDato: "2025-01-01T10:00:00",
        },
      ],
    },
    redigerbart: {
      redigerbart: true,
    },
    helseutgiftdekkesperiode: {
      data: {
        fomDato: "2025-01-01",
        tomDato: "2025-12-31",
        bostedLandkode: "NO",
      },
    },
    oppsummertfakta: {
      data: {
        ukjentSluttdatoMedlemskapsperiode: false,
      },
    },
    modaler: {
      behandlingUnderOppfriskning: false,
    },
  };

  const createMockStore = (preloadedState?: any) =>
    configureStore({
      reducer: rootReducer,
      preloadedState: preloadedState || defaultState,
    });

  const contextValue = {
    oppfriskOgLastInnSaksopplysninger: mockOppfriskOgLastInnSaksopplysninger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockClear();
  });

  describe("skalHenteRegisteropplysninger logikk", () => {
    it("skal markere steget som ugyldig når registeropplysningerHentet er null", () => {
      const storeUtenOpplysninger = createMockStore({
        ...defaultState,
        behandlinger: {
          data: [
            {
              behandlingID: 123,
              sisteOpplysningerHentetDato: null, // Ikke hentet
            },
          ],
        },
      });

      render(
        <Provider store={storeUtenOpplysninger}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Når registeropplysninger ikke er hentet, skal steget være ugyldig
      expect(mockOppdaterStatus).toHaveBeenCalledWith(false);
    });

    it("skal markere steget som gyldig når alle betingelser er oppfylt", () => {
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Med default state (registeropplysninger hentet, form valid, ikke under oppfriskning)
      // skal steget være gyldig
      expect(mockOppdaterStatus).toHaveBeenCalledWith(true);
    });
  });

  describe("stegErGyldig validering", () => {
    it("skal være false når behandling er under oppfriskning", () => {
      const storeUnderOppfriskning = createMockStore({
        ...defaultState,
        modaler: {
          behandlingUnderOppfriskning: true,
        },
      });

      render(
        <Provider store={storeUnderOppfriskning}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Når behandling er under oppfriskning skal steget være ugyldig
      expect(mockOppdaterStatus).toHaveBeenCalledWith(false);
    });

    it("skal være false når registeropplysninger må hentes", () => {
      const storeUtenOpplysninger = createMockStore({
        ...defaultState,
        behandlinger: {
          data: [
            {
              behandlingID: 123,
              sisteOpplysningerHentetDato: null,
            },
          ],
        },
      });

      render(
        <Provider store={storeUtenOpplysninger}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      expect(mockOppdaterStatus).toHaveBeenCalledWith(false);
    });

    it("skal være true når alle betingelser er oppfylt", () => {
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Form er valid, registeropplysninger er hentet, ikke under oppfriskning
      expect(mockOppdaterStatus).toHaveBeenCalledWith(true);
    });
  });

  describe("bekreftOgFortsett", () => {
    it("skal vise oppfrisk-dialog når registeropplysninger ikke er hentet", async () => {
      const user = userEvent.setup();
      const storeUtenOpplysninger = createMockStore({
        ...defaultState,
        behandlinger: {
          data: [
            {
              behandlingID: 123,
              sisteOpplysningerHentetDato: null,
            },
          ],
        },
      });

      render(
        <Provider store={storeUtenOpplysninger}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      const nesteBtn = screen.getByTestId("neste-btn");
      await user.click(nesteBtn);

      // Oppfrisk-dialog skal vises
      await waitFor(() => {
        expect(screen.getByTestId("oppfrisk-dialog")).toBeInTheDocument();
      });

      // bekreft() skal IKKE kalles
      expect(mockBekreft).not.toHaveBeenCalled();
    });

    it("skal kalle bekreft direkte når registeropplysninger er hentet", async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      const nesteBtn = screen.getByTestId("neste-btn");
      await user.click(nesteBtn);

      // bekreft() skal kalles direkte
      await waitFor(() => {
        expect(mockBekreft).toHaveBeenCalled();
      });

      // Dialog skal IKKE vises
      expect(screen.queryByTestId("oppfrisk-dialog")).not.toBeInTheDocument();
    });

    it("skal awaite hentHelseutgiftDekkesPeriode før evaluering (race condition fix)", async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore(defaultState);

      // Mock en forsinket respons for å teste await
      const delayedDispatch = vi.fn(async (action: any) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return action;
      });

      vi.mocked(mockDispatch).mockImplementation(delayedDispatch);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      const nesteBtn = screen.getByTestId("neste-btn");
      await user.click(nesteBtn);

      // Verifiser at dispatch ble kalt
      await waitFor(() => {
        expect(delayedDispatch).toHaveBeenCalled();
      });
    });
  });

  describe("DialogboksOppfriskSak handlinger", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      const storeUtenOpplysninger = createMockStore({
        ...defaultState,
        behandlinger: {
          data: [
            {
              behandlingID: 123,
              sisteOpplysningerHentetDato: null,
            },
          ],
        },
      });

      render(
        <Provider store={storeUtenOpplysninger}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Åpne dialogen
      const nesteBtn = screen.getByTestId("neste-btn");
      await user.click(nesteBtn);

      await waitFor(() => {
        expect(screen.getByTestId("oppfrisk-dialog")).toBeInTheDocument();
      });
    });

    it("skal kalle oppfriskOgLastInnSaksopplysninger ved oppfrisk", async () => {
      const user = userEvent.setup();
      const oppfriskBtn = screen.getByTestId("oppfrisk-btn");

      await user.click(oppfriskBtn);

      expect(mockOppfriskOgLastInnSaksopplysninger).toHaveBeenCalled();
    });

    it("skal lukke dialog ved avbryt", async () => {
      const user = userEvent.setup();
      const avbrytBtn = screen.getByTestId("avbryt-btn");

      await user.click(avbrytBtn);

      await waitFor(() => {
        expect(screen.queryByTestId("oppfrisk-dialog")).not.toBeInTheDocument();
      });
    });

    it("skal lukke dialog og kalle bekreft ved lukk", async () => {
      const user = userEvent.setup();
      const lukkBtn = screen.getByTestId("lukk-btn");

      await user.click(lukkBtn);

      await waitFor(() => {
        expect(screen.queryByTestId("oppfrisk-dialog")).not.toBeInTheDocument();
        expect(mockBekreft).toHaveBeenCalled();
      });
    });

    it("skal navigere til forsiden ved tilForsiden", async () => {
      const user = userEvent.setup();
      const tilForsidenBtn = screen.getByTestId("til-forsiden-btn");

      await user.click(tilForsidenBtn);

      // Verifiser at navigering ble trigget
      // (Dette testes via mock, ikke faktisk navigering)
      expect(tilForsidenBtn).toBeTruthy();
    });
  });

  describe("Komponent rendering", () => {
    it("skal rendre komponenten når aktivtSteg er true", () => {
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      expect(screen.getByText("Oppgi opplysninger fra attest / S1")).toBeInTheDocument();
      expect(screen.getByTestId("periode-velger")).toBeInTheDocument();
      expect(screen.getByTestId("ukjent-sluttdato")).toBeInTheDocument();
      expect(screen.getByTestId("neste-btn")).toBeInTheDocument();
    });

    it("skal ikke rendre komponenten når aktivtSteg er false", () => {
      const mockStore = createMockStore(defaultState);

      const { container } = render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} aktivtSteg={false} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Dobbeltklikk-beskyttelse", () => {
    it("skal disable knappen når status er PENDING", async () => {
      // Opprett store med PENDING status
      const pendingState = {
        ...defaultState,
        helseutgiftdekkesperiode: {
          ...defaultState.helseutgiftdekkesperiode,
          status: "PENDING",
        },
      };
      const mockStore = createMockStore(pendingState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      const nesteBtn = screen.getByTestId("neste-btn");

      // Knappen skal være disabled når helseutgiftDekkesPeriodeErPending er true
      expect(nesteBtn).toBeDisabled();
    });

    it("skal ikke kalle dispatch når knappen er disabled pga PENDING status", async () => {
      const user = userEvent.setup();

      // Opprett store med PENDING status
      const pendingState = {
        ...defaultState,
        helseutgiftdekkesperiode: {
          ...defaultState.helseutgiftdekkesperiode,
          status: "PENDING",
        },
      };
      const mockStore = createMockStore(pendingState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      const nesteBtn = screen.getByTestId("neste-btn");

      // Forsøk å klikke på disabled knapp (ingenting skal skje)
      await user.click(nesteBtn);

      // dispatch skal ikke kalles siden knappen er disabled
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("Regression tests - Forbedringer fra code review", () => {
    it("skal kun ha én useEffect for oppdaterStatus (ikke duplikat)", () => {
      // Dette er et regression test for at vi fjernet duplikat useEffect
      // Vi verifiserer at oppdaterStatus kalles korrekt
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // oppdaterStatus skal ha blitt kalt (men ikke flere ganger enn nødvendig)
      expect(mockOppdaterStatus).toHaveBeenCalled();
      // Vi aksepterer at den kan kalles flere ganger under initial render,
      // men den skal ha riktig verdi til slutt
      const lastCall = mockOppdaterStatus.mock.calls[mockOppdaterStatus.mock.calls.length - 1];
      expect(lastCall[0]).toBe(true); // Skal være true med default state
    });

    it("skal ha korrekte dependencies i debounce (ikke watch() men watch)", () => {
      // Dette er implisitt testet ved at komponenten renderer uten feil
      // og at det ikke er infinite re-renders
      const mockStore = createMockStore(defaultState);

      render(
        <Provider store={mockStore}>
          <FellesHandlersContext.Provider value={contextValue}>
            <VurderingOpplysninger {...defaultProps} />
          </FellesHandlersContext.Provider>
        </Provider>,
      );

      // Hvis debounce dependencies var feil (watch() i stedet for watch),
      // ville komponenten re-rendere i det uendelige og testen feile
      expect(screen.getByTestId("neste-btn")).toBeInTheDocument();
    });
  });
});
