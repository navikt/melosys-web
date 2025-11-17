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
    avklartefakta: [],
    vilkar: [],
    tilgjengeligeHandlers: {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      byggLovvalgsperioder: vi.fn(),
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
      expect(trygdeavgift.status).toBeNull();
    });

    it("skal sette kriterier med kun ett kriterie som alltid matcher", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const kriterier = trygdeavgift.kriterier as any;
      expect(kriterier).toHaveLength(1);
      expect(kriterier[0].nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(kriterier[0].exec()).toBe(true);
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere tom data-struktur", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const samleRelevanteData = trygdeavgift.samleRelevanteData as any;
      const relevantData = samleRelevanteData(propsLight);

      expect(relevantData).toEqual({});
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal returnere harAvklaring true som default når trygdeavgiftStatus ikke er satt", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const beregnRelevantUI = trygdeavgift.beregnRelevantUI as any;
      const relevantUI = beregnRelevantUI(propsLight);

      expect(relevantUI).toEqual({
        harAvklaring: true,
      });
    });

    it("skal returnere harAvklaring basert på trygdeavgiftStatus når den er satt", () => {
      const propsLightMedStatus = createMockPropsLight();
      (propsLightMedStatus as any).trygdeavgiftStatus = false;
      const trygdeavgift = new Trygdeavgift(propsLightMedStatus, 6);

      const beregnRelevantUI = trygdeavgift.beregnRelevantUI as any;
      const relevantUI = beregnRelevantUI(propsLightMedStatus);

      expect(relevantUI).toEqual({
        harAvklaring: false,
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

    it("skal ha oppdaterStatus handler som kaller oppdaterStegData med trygdeavgift-status", () => {
      handlers.oppdaterStatus(true);

      expect(propsLight.tilgjengeligeHandlers.oppdaterStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        expect.objectContaining({
          felt: "trygdeavgiftStatus",
          type: "trygdeavgiftStatus",
          innhold: true,
          oppdaterRedux: false, // false for å unngå unødvendig re-render
        }),
      );
    });

    it("skal ha oppdaterStatus handler som kan sette status til false", () => {
      handlers.oppdaterStatus(false);

      expect(propsLight.tilgjengeligeHandlers.oppdaterStegData).toHaveBeenCalledWith(
        STEG.VURDERING_TRYGDEAVGIFT,
        expect.objectContaining({
          felt: "trygdeavgiftStatus",
          type: "trygdeavgiftStatus",
          innhold: false,
          oppdaterRedux: false, // false for å unngå unødvendig re-render
        }),
      );
    });
  });

  describe("byggSteg", () => {
    it("skal returnere komplett steg-objekt med status OK som default", () => {
      const propsLight = createMockPropsLight({
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
      expect(byggetSteg.handlers).toBeDefined();
    });

    it("skal returnere steg med UBEHANDLET status når trygdeavgiftStatus er false", () => {
      const propsLight = createMockPropsLight({
        aktivtSteg: true,
      });
      (propsLight as any).trygdeavgiftStatus = false;
      const stegPosisjon = 6;
      const trygdeavgift = new Trygdeavgift(propsLight, stegPosisjon);

      const byggetSteg = trygdeavgift.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.UBEHANDLET);
      expect(byggetSteg.data.tilstand).toEqual({ harAvklaring: false });
    });
  });

  describe("hentStatus", () => {
    it("skal returnere OK som default når trygdeavgiftStatus ikke er satt", () => {
      const propsLight = createMockPropsLight();
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });

    it("skal returnere UBEHANDLET når trygdeavgiftStatus er false", () => {
      const propsLight = createMockPropsLight();
      (propsLight as any).trygdeavgiftStatus = false;
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.UBEHANDLET);
    });

    it("skal returnere OK når trygdeavgiftStatus er true", () => {
      const propsLight = createMockPropsLight();
      (propsLight as any).trygdeavgiftStatus = true;
      const trygdeavgift = new Trygdeavgift(propsLight, 6);

      const status = trygdeavgift.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });
  });
});
