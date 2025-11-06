import { describe, expect, it, vi } from "vitest";
import ArbeidTjenestepersonEllerFlyVedtak from "./arbeid_tjenesteperson_eller_fly_vedtak";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import MKV from "../../../../melosyskodeverk";

describe("ArbeidTjenestepersonEllerFlyVedtak", () => {
  const mockPropsLight = {
    generiskStegRedigerbart: true,
    tilgjengeligeHandlers: {
      tilbake: vi.fn(),
      lagreLovvalgsperioder: vi.fn(),
      oppdaterStegData: vi.fn(),
      slettStegData: vi.fn(),
      kontrollerFerdigbehandling: vi.fn(),
      validerMottatteOpplysninger: vi.fn(),
    },
    avklartefakta: [],
    harFeilmeldinger: false,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
  };

  describe("steg konfiguration", () => {
    it("skal ha riktig steg-ID", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.id).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("skal ha riktig tittel", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.tittel).toBe("Vedtak");
    });

    it("skal ha status OK", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg._status).toBe("OK");
    });

    it("skal ha tom kriterier array", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.kriterier).toEqual([]);
    });
  });

  describe("lovvalgsbestemmelse mapping", () => {
    it("skal mappe FO_883_2004_ART11_3A til FO_883_2004_ART11_5 for visning", () => {
      const propsWithArt11_3A = {
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      };

      const steg = new ArbeidTjenestepersonEllerFlyVedtak(propsWithArt11_3A, 0);
      const relevanteData = steg.samleRelevanteData(propsWithArt11_3A);

      expect(relevanteData.lovvalgsbestemmelseSomSkalVises).toBe(
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
      );
    });

    it("skal ikke mappe FO_883_2004_ART11_3B - skal vises som den er", () => {
      const propsWithArt11_3B = {
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      };

      const steg = new ArbeidTjenestepersonEllerFlyVedtak(propsWithArt11_3B, 0);
      const relevanteData = steg.samleRelevanteData(propsWithArt11_3B);

      expect(relevanteData.lovvalgsbestemmelseSomSkalVises).toBe(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );
    });

    it("skal bevare andre lovvalgsbestemmelser uendret", () => {
      const testBestemmelse = "EN_ANNEN_BESTEMMELSE";
      const propsWithAnnenBestemmelse = {
        ...mockPropsLight,
        lovvalgsbestemmelse: testBestemmelse,
      };

      const steg = new ArbeidTjenestepersonEllerFlyVedtak(propsWithAnnenBestemmelse, 0);
      const relevanteData = steg.samleRelevanteData(propsWithAnnenBestemmelse);

      expect(relevanteData.lovvalgsbestemmelseSomSkalVises).toBe(testBestemmelse);
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere redigerbart status", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);
      const relevanteData = steg.samleRelevanteData(mockPropsLight);

      expect(relevanteData.redigerbart).toBe(true);
    });

    it("skal returnere harFeilmeldinger", () => {
      const propsWithFeil = {
        ...mockPropsLight,
        harFeilmeldinger: true,
      };

      const steg = new ArbeidTjenestepersonEllerFlyVedtak(propsWithFeil, 0);
      const relevanteData = steg.samleRelevanteData(propsWithFeil);

      expect(relevanteData.harFeilmeldinger).toBe(true);
    });

    it("skal returnere informertMyndighetFakta", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);
      const relevanteData = steg.samleRelevanteData(mockPropsLight);

      expect(relevanteData.informertMyndighetFakta).toBeDefined();
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal returnere tomt objekt", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);
      const relevantUI = steg.beregnRelevantUI();

      expect(relevantUI).toEqual({});
    });
  });

  describe("handlers", () => {
    it("skal ha tilbake handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.tilbake).toBe(mockPropsLight.tilgjengeligeHandlers.tilbake);
    });

    it("skal ha lagreLovvalgsperioder handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.lagreLovvalgsperioder).toBe(mockPropsLight.tilgjengeligeHandlers.lagreLovvalgsperioder);
    });

    it("skal ha oppdaterData handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.oppdaterData).toBeDefined();
      expect(typeof steg.handlers.oppdaterData).toBe("function");
    });

    it("skal ha slettData handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.slettData).toBeDefined();
      expect(typeof steg.handlers.slettData).toBe("function");
    });

    it("skal ha kontrollerFerdigbehandling handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.kontrollerFerdigbehandling).toBe(
        mockPropsLight.tilgjengeligeHandlers.kontrollerFerdigbehandling,
      );
    });

    it("skal ha validerMottatteOpplysninger handler", () => {
      const steg = new ArbeidTjenestepersonEllerFlyVedtak(mockPropsLight, 0);

      expect(steg.handlers.validerMottatteOpplysninger).toBe(
        mockPropsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
      );
    });
  });
});
