import { describe, it, expect, vi, beforeEach } from "vitest";
import Trygdeavgift from "./trygdeavgift";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift as VurderingTrygdeavgiftFTRL } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";

describe("Trygdeavgift steg-klasse", () => {
  // Mock propsLight factory
  const createMockPropsLight = (overrides = {}) => ({
    behandlingID: "test-behandling-123",
    generiskStegRedigerbart: true,
    aktivtSteg: false,
    avklartefakta: {},
    vilkar: {},
    tilgjengeligeHandlers: {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      oppdaterStegData: vi.fn(),
      slettStegData: vi.fn(),
    },
    ...overrides,
  });

  describe("Constructor", () => {
    it("skal sette grunnleggende felter korrekt", () => {
      const propsLight = createMockPropsLight();
      const stegPosisjon = 6;
      const trygdeavgift = new Trygdeavgift(propsLight, stegPosisjon);

      expect(trygdeavgift.id).toBe(STEG.VURDERING_TRYGDEAVGIFT);
      expect(trygdeavgift.tittel).toBe("Trygdeavgift");
      expect(trygdeavgift.komponent).toBe(VurderingTrygdeavgiftFTRL);
      expect(trygdeavgift.status).toBe(FANE_STATUS.OK);
    });

    it("skal sette kriterier med kun ett kriterie som alltid matcher", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      expect(trygdeavgift.kriterier).toHaveLength(1);
      expect(trygdeavgift.kriterier[0].nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(trygdeavgift.kriterier[0].exec()).toBe(true);
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere korrekt data-struktur med behandlingID og redigerbart", () => {
      const propsLight = createMockPropsLight({
        behandlingID: "behandling-456",
        generiskStegRedigerbart: true,
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const relevantData = trygdeavgift.samleRelevanteData(propsLight);

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

      const relevantData = trygdeavgift.samleRelevanteData(propsLight);

      expect(relevantData).toEqual({
        behandlingID: "behandling-789",
        redigerbart: false,
      });
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal alltid returnere harAvklaring true", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const relevantUI = trygdeavgift.beregnRelevantUI(propsLight);

      expect(relevantUI).toEqual({
        harAvklaring: true,
      });
    });

    it("skal returnere harAvklaring true uavhengig av propsLight", () => {
      const propsLight = createMockPropsLight({
        avklartefakta: { noeData: "verdi" },
        vilkar: { betingelse: false },
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const relevantUI = trygdeavgift.beregnRelevantUI(propsLight);

      expect(relevantUI).toEqual({
        harAvklaring: true,
      });
    });
  });

  describe("nesteSteg", () => {
    it("skal alltid returnere ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const nesteSteg = trygdeavgift.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("skal returnere ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK selv med ulike avklartefakta", () => {
      const propsLight = createMockPropsLight({
        avklartefakta: { someFact: "someValue" },
        vilkar: { someCondition: true },
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const nesteSteg = trygdeavgift.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });
  });

  describe("handlers", () => {
    let propsLight: any;
    let trygdeavgift: Trygdeavgift;

    beforeEach(() => {
      propsLight = createMockPropsLight();
      trygdeavgift = new Trygdeavgift(propsLight, 6);
    });

    it("skal ha bekreft handler koblet til bekreftOgFortsett fra propsLight", () => {
      expect(trygdeavgift.handlers.bekreft).toBe(propsLight.tilgjengeligeHandlers.bekreftOgFortsett);
    });

    it("skal ha tilbake handler koblet til propsLight", () => {
      expect(trygdeavgift.handlers.tilbake).toBe(propsLight.tilgjengeligeHandlers.tilbake);
    });

    it("skal ha oppdaterData handler som kaller oppdaterStegData med steg-id", () => {
      const felt = "trygdeavgiftsperioder";
      const verdi = [{ fom: "2024-01-01", tom: "2024-12-31" }];

      trygdeavgift.handlers.oppdaterData(felt, verdi);

      expect(propsLight.tilgjengeligeHandlers.oppdaterStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        felt,
        verdi,
      );
    });

    it("skal ha slettData handler som kaller slettStegData med steg-id", () => {
      const data = { someData: "someValue" };

      trygdeavgift.handlers.slettData(data);

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(STEG.VURDERING_TRYGDEAVGIFT, data);
    });

    it("skal kunne kalle slettData uten data parameter", () => {
      trygdeavgift.handlers.slettData();

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        undefined,
      );
    });

    it("skal ha oppdaterStatus handler som er en no-op funksjon", () => {
      // oppdaterStatus er en no-op i Trygdeavgift
      expect(trygdeavgift.handlers.oppdaterStatus).toBeInstanceOf(Function);

      // Skal ikke kaste feil når den kalles
      expect(() => trygdeavgift.handlers.oppdaterStatus()).not.toThrow();
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

      const byggetSteg = trygdeavgift.byggSteg();

      expect(byggetSteg).toMatchObject({
        id: STEG.VURDERING_TRYGDEAVGIFT,
        komponent: VurderingTrygdeavgiftFTRL,
        tittel: "Trygdeavgift",
        stegPosisjon: 6,
        status: FANE_STATUS.OK,
      });
      expect(byggetSteg.data).toBeDefined();
      expect(byggetSteg.data.tilstand).toEqual({ harAvklaring: true });
      expect(byggetSteg.data.behandlingID).toBe("test-123");
      expect(byggetSteg.data.redigerbart).toBe(true);
      expect(byggetSteg.handlers).toBeDefined();
    });
  });

  describe("hentStatus", () => {
    it("skal returnere OK siden harAvklaring alltid er true", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });

    it("skal returnere OK uavhengig av propsLight-verdier", () => {
      const propsLight = createMockPropsLight({
        behandlingID: undefined,
        generiskStegRedigerbart: false,
      });
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });
  });
});
