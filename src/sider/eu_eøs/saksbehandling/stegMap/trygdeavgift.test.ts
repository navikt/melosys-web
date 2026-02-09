import { describe, it, expect, vi, beforeEach } from "vitest";
import Trygdeavgift from "./trygdeavgift";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift } from "../../../trygdeavgift/medlemskapsperiode/vurderingTrygdeavgift";

describe("Trygdeavgift steg-klasse", () => {
  // Mock propsLight factory
  const createMockPropsLight = (overrides = {}) => ({
    behandlingID: "test-behandling-123",
    generiskStegRedigerbart: true,
    aktivtSteg: false,
    avklartefakta: [],
    vilkar: [],
    stegErGyldig: false,
    tilgjengeligeHandlers: {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      byggLovvalgsperioder: vi.fn(),
      oppdaterStegData: vi.fn(),
      slettStegData: vi.fn(),
      oppdater: vi.fn(),
    },
    ...overrides,
  });

  describe("Constructor", () => {
    it("skal sette grunnleggende felter korrekt", () => {
      const propsLight = createMockPropsLight();
      const stegPosisjon = 6;
      const trygdeavgift = new Trygdeavgift(propsLight, stegPosisjon);
      const handlers = trygdeavgift.handlers as any;
      handlers.oppdaterStatus(false);

      expect(trygdeavgift.id).toBe(STEG.VURDERING_TRYGDEAVGIFT);
      expect(trygdeavgift.tittel).toBe("Trygdeavgift");
      expect(trygdeavgift.komponent).toBe(VurderingTrygdeavgift);
      expect(trygdeavgift.status).toBe(FANE_STATUS.OK);
    });

    it("kriterierer er default false", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const kriterier = trygdeavgift.kriterier as any;
      expect(kriterier).toHaveLength(1);
      expect(kriterier[0].nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(kriterier[0].exec()).toBe(false);
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere korrekt data-struktur med behandlingID og redigerbart", () => {
      const propsLight = createMockPropsLight({
        behandlingID: "behandling-456",
        generiskStegRedigerbart: true,
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const samleRelevanteData = trygdeavgift.samleRelevanteData as any;
      const relevantData = samleRelevanteData(propsLight);

      expect(relevantData).toEqual({
        behandlingID: "behandling-456",
        redigerbart: true,
      });
    });

    it("skal håndtere redigerbart false", () => {
      const propsLight = createMockPropsLight({
        behandlingID: "behandling-789",
        generiskStegRedigerbart: false,
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const samleRelevanteData = trygdeavgift.samleRelevanteData as any;
      const relevantData = samleRelevanteData(propsLight);

      expect(relevantData).toEqual({
        behandlingID: "behandling-789",
        redigerbart: false,
      });
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal returnere stegErGyldig false som default", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const beregnRelevantUI = trygdeavgift.beregnRelevantUI as any;
      const relevantUI = beregnRelevantUI();

      expect(relevantUI).toEqual({
        stegErGyldig: false,
      });
    });

    it("skal følge stegErGyldigState når oppdaterStatus kalles", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);
      const handlers = trygdeavgift.handlers as any;

      const beregnRelevantUI = trygdeavgift.beregnRelevantUI as any;

      handlers.oppdaterStatus(true);
      expect(beregnRelevantUI()).toEqual({ stegErGyldig: true });

      handlers.oppdaterStatus(false);
      expect(beregnRelevantUI()).toEqual({ stegErGyldig: false });
    });
  });

  describe("nesteSteg", () => {
    it("Returnere ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK bare når stegErGyldig er true", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);
      const handlers = trygdeavgift.handlers as any;

      handlers.oppdaterStatus(true);
      const nesteSteg = trygdeavgift.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("skal ikke returnere ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK når stegErGyldig er false", () => {
      const propsLight = createMockPropsLight({});
      const trygdeavgift = new Trygdeavgift(propsLight, 6);
      const handlers = trygdeavgift.handlers as any;

      handlers.oppdaterStatus(false);
      const nesteSteg = trygdeavgift.nesteSteg();

      expect(nesteSteg).toBe(undefined);
    });
  });

  describe("handlers", () => {
    let propsLight: any;
    let trygdeavgift: Trygdeavgift;
    let handlers: any;

    beforeEach(() => {
      propsLight = createMockPropsLight();
      trygdeavgift = new Trygdeavgift(propsLight, 6);
      handlers = trygdeavgift.handlers as any;
    });

    it("skal ha bekreft handler koblet til bekreftOgFortsett fra propsLight", () => {
      expect(handlers.bekreft).toBe(propsLight.tilgjengeligeHandlers.bekreftOgFortsett);
    });

    it("skal ha tilbake handler koblet til propsLight", () => {
      expect(handlers.tilbake).toBe(propsLight.tilgjengeligeHandlers.tilbake);
    });

    it("skal ha oppdaterData handler som kaller oppdaterStegData med steg-id", () => {
      const felt = "trygdeavgiftsperioder";
      const verdi = [{ fom: "2024-01-01", tom: "2024-12-31" }];

      handlers.oppdaterData(felt, verdi);

      expect(propsLight.tilgjengeligeHandlers.oppdaterStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        felt,
        verdi,
      );
    });

    it("skal ha slettData handler som kaller slettStegData med steg-id", () => {
      const data = { someData: "someValue" };

      handlers.slettData(data);

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(STEG.VURDERING_TRYGDEAVGIFT, data);
    });

    it("skal kunne kalle slettData uten data parameter", () => {
      handlers.slettData();

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        undefined,
      );
    });

    it("skal ha oppdaterStatus handler som er en no-op funksjon", () => {
      // oppdaterStatus er en no-op i Trygdeavgift
      expect(handlers.oppdaterStatus).toBeInstanceOf(Function);

      // Skal ikke kaste feil når den kalles
      expect(() => handlers.oppdaterStatus()).not.toThrow();
    });
  });

  describe("byggSteg", () => {
    it("skal returnere komplett steg-objekt", () => {
      const propsLight = createMockPropsLight({
        behandlingID: "test-123",
        generiskStegRedigerbart: true,
        aktivtSteg: true,
      });
      const stegPosisjon = 6;
      const trygdeavgift = new Trygdeavgift(propsLight, stegPosisjon);
      const handlers = trygdeavgift.handlers as any;

      handlers.oppdaterStatus(false);
      const byggetSteg = trygdeavgift.byggSteg();

      expect(byggetSteg).toMatchObject({
        id: STEG.VURDERING_TRYGDEAVGIFT,
        komponent: VurderingTrygdeavgift,
        tittel: "Trygdeavgift",
        stegPosisjon: 6,
        status: FANE_STATUS.UBEHANDLET,
      });
      expect(byggetSteg.data).toBeDefined();
      expect(byggetSteg.data.tilstand).toEqual({ stegErGyldig: false });
      expect(byggetSteg.data.behandlingID).toBe("test-123");
      expect(byggetSteg.data.redigerbart).toBe(true);
      expect(byggetSteg.handlers).toBeDefined();
    });
  });

  describe("hentStatus", () => {
    it("skal returnere OK når stegErGyldigState er true", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);
      const handlers = trygdeavgift.handlers as any;

      handlers.oppdaterStatus(true);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });

    it("skal returnere UBEHANDLET når stegErGyldigState er false", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);
      const handlers = trygdeavgift.handlers as any;

      handlers.oppdaterStatus(false);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.UBEHANDLET);
    });
  });
});
