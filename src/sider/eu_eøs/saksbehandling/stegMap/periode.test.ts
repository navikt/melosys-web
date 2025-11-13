import { describe, it, expect, vi, beforeEach } from "vitest";
import Periode from "./periode";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriode from "../../stegKomponenter/vurderingPeriode/vurderingPeriode";
import MKV from "../../../../melosyskodeverk";

describe("Periode steg-klasse", () => {
  // Mock propsLight factory
  const createMockPropsLight = (overrides = {}) => ({
    lovvalgsbestemmelse: undefined,
    generiskStegRedigerbart: true,
    aktivtSteg: false,
    avklartefakta: {},
    vilkar: {},
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
      const stegPosisjon = 5;
      const periode = new Periode(propsLight, stegPosisjon);

      expect(periode.id).toBe(STEG.VURDERING_PERIODE);
      expect(periode.tittel).toBe("Periode");
      expect(periode.komponent).toBe(VurderingPeriode);
      expect(periode.status).toBe(FANE_STATUS.OK);
    });

    it("skal mappe ART11_3A til ART11_5 for visning", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      });
      const periode = new Periode(propsLight, 5);

      const relevantData = periode.samleRelevanteData(propsLight);

      expect(relevantData.lovvalgsbestemmelseSomSkalVises).toBe(
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
      );
      expect(relevantData.lovvalgsbestemmelseSomSkalLagres).toBe(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      );
    });

    it("skal beholde annen lovvalgsbestemmelse som den er", () => {
      const testBestemmelse = "FO_883_2004_ART11_4";
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: testBestemmelse,
      });
      const periode = new Periode(propsLight, 5);

      const relevantData = periode.samleRelevanteData(propsLight);

      expect(relevantData.lovvalgsbestemmelseSomSkalVises).toBe(testBestemmelse);
      expect(relevantData.lovvalgsbestemmelseSomSkalLagres).toBe(testBestemmelse);
    });

    it("skal sette kriterier med kun ett kriterie som alltid matcher", () => {
      const propsLight = createMockPropsLight();
      const periode = new Periode(propsLight, 5);

      expect(periode.kriterier).toHaveLength(1);
      expect(periode.kriterier[0].nesteSteg).toBe(STEG.VURDERING_TRYGDEAVGIFT);
      expect(periode.kriterier[0].exec()).toBe(true);
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere korrekt data-struktur", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: "FO_883_2004_ART11_4",
        generiskStegRedigerbart: true,
        aktivtSteg: true,
      });
      const periode = new Periode(propsLight, 5);

      const relevantData = periode.samleRelevanteData(propsLight);

      expect(relevantData).toEqual({
        redigerbart: true,
        lovvalgsbestemmelseSomSkalVises: "FO_883_2004_ART11_4",
        lovvalgsbestemmelseSomSkalLagres: "FO_883_2004_ART11_4",
        aktivtSteg: true,
      });
    });

    it("skal håndtere manglende lovvalgsbestemmelse", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: undefined,
        generiskStegRedigerbart: false,
        aktivtSteg: false,
      });
      const periode = new Periode(propsLight, 5);

      const relevantData = periode.samleRelevanteData(propsLight);

      expect(relevantData).toEqual({
        redigerbart: false,
        lovvalgsbestemmelseSomSkalVises: undefined,
        lovvalgsbestemmelseSomSkalLagres: undefined,
        aktivtSteg: false,
      });
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal returnere harAvklaring true når lovvalgsbestemmelse finnes", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: "FO_883_2004_ART11_4",
      });
      const periode = new Periode(propsLight, 5);

      const relevantUI = periode.beregnRelevantUI();

      expect(relevantUI).toEqual({
        harAvklaring: true,
      });
    });

    it("skal returnere harAvklaring false når lovvalgsbestemmelse mangler", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: undefined,
      });
      const periode = new Periode(propsLight, 5);

      const relevantUI = periode.beregnRelevantUI();

      expect(relevantUI).toEqual({
        harAvklaring: false,
      });
    });

    it("skal returnere harAvklaring false når lovvalgsbestemmelse er null", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: null,
      });
      const periode = new Periode(propsLight, 5);

      const relevantUI = periode.beregnRelevantUI();

      expect(relevantUI).toEqual({
        harAvklaring: false,
      });
    });
  });

  describe("nesteSteg", () => {
    it("skal alltid returnere VURDERING_TRYGDEAVGIFT", () => {
      const propsLight = createMockPropsLight();
      const periode = new Periode(propsLight, 5);

      const nesteSteg = periode.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_TRYGDEAVGIFT);
    });

    it("skal returnere VURDERING_TRYGDEAVGIFT selv med ulike avklartefakta", () => {
      const propsLight = createMockPropsLight({
        avklartefakta: { someFact: "someValue" },
        vilkar: { someCondition: true },
      });
      const periode = new Periode(propsLight, 5);

      const nesteSteg = periode.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_TRYGDEAVGIFT);
    });
  });

  describe("handlers", () => {
    let propsLight: any;
    let periode: Periode;

    beforeEach(() => {
      propsLight = createMockPropsLight();
      periode = new Periode(propsLight, 5);
    });

    it("skal ha bekreftOgFortsett handler koblet til propsLight", () => {
      expect(periode.handlers.bekreftOgFortsett).toBe(propsLight.tilgjengeligeHandlers.bekreftOgFortsett);
    });

    it("skal ha tilbake handler koblet til propsLight", () => {
      expect(periode.handlers.tilbake).toBe(propsLight.tilgjengeligeHandlers.tilbake);
    });

    it("skal ha byggLovvalgsperioder handler koblet til propsLight", () => {
      expect(periode.handlers.byggLovvalgsperioder).toBe(propsLight.tilgjengeligeHandlers.byggLovvalgsperioder);
    });

    it("skal ha oppdaterData handler som kaller oppdaterStegData med steg-id", () => {
      const felt = "lovvalgsbestemmelse";
      const verdi = "FO_883_2004_ART11_4";

      periode.handlers.oppdaterData(felt, verdi);

      expect(propsLight.tilgjengeligeHandlers.oppdaterStegData).toHaveBeenCalledWith(
        STEG.VURDERING_PERIODE,
        felt,
        verdi,
      );
    });

    it("skal ha slettData handler som kaller slettStegData med steg-id", () => {
      const data = { someData: "someValue" };

      periode.handlers.slettData(data);

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(STEG.VURDERING_PERIODE, data);
    });

    it("skal kunne kalle slettData uten data parameter", () => {
      periode.handlers.slettData();

      expect(propsLight.tilgjengeligeHandlers.slettStegData).toHaveBeenCalledWith(STEG.VURDERING_PERIODE, undefined);
    });
  });

  describe("byggSteg", () => {
    it("skal returnere komplett steg-objekt", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: "FO_883_2004_ART11_4",
        generiskStegRedigerbart: true,
        aktivtSteg: true,
      });
      const stegPosisjon = 5;
      const periode = new Periode(propsLight, stegPosisjon);

      const byggetSteg = periode.byggSteg();

      expect(byggetSteg).toMatchObject({
        id: STEG.VURDERING_PERIODE,
        komponent: VurderingPeriode,
        tittel: "Periode",
        stegPosisjon: 5,
        status: FANE_STATUS.OK,
      });
      expect(byggetSteg.data).toBeDefined();
      expect(byggetSteg.data.tilstand).toEqual({ harAvklaring: true });
      expect(byggetSteg.handlers).toBeDefined();
    });
  });

  describe("hentStatus", () => {
    it("skal returnere OK når lovvalgsbestemmelse finnes", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: "FO_883_2004_ART11_4",
      });
      const periode = new Periode(propsLight, 5);

      const status = periode.hentStatus();

      expect(status).toBe(FANE_STATUS.OK);
    });

    it("skal returnere UBEHANDLET når lovvalgsbestemmelse mangler", () => {
      const propsLight = createMockPropsLight({
        lovvalgsbestemmelse: undefined,
      });
      const periode = new Periode(propsLight, 5);

      const status = periode.hentStatus();

      expect(status).toBe(FANE_STATUS.UBEHANDLET);
    });
  });
});
