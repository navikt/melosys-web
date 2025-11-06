import VurderingPeriodeOffentligAnsattSteg from "./vurderingPeriode";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import MKV from "../../../../melosyskodeverk";

const mockPropsLight = {
  generiskStegRedigerbart: true,
  tilgjengeligeHandlers: {
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
    byggLovvalgsperioder: vi.fn(),
    oppdaterStegData: vi.fn(),
    slettStegData: vi.fn(),
  },
};

describe("VurderingPeriodeOffentligAnsattSteg", () => {
  describe("nesteSteg", () => {
    it("skal alltid gå til TRYGDEAVGIFT som neste steg", () => {
      const steg = new VurderingPeriodeOffentligAnsattSteg({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      });

      expect(steg.nesteSteg()).toBe(STEG.TRYGDEAVGIFT);
    });
  });

  describe("harAvklaring", () => {
    it("skal returnere true når lovvalgsbestemmelse er satt", () => {
      const propsLight = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      };

      expect(VurderingPeriodeOffentligAnsattSteg.harAvklaring(propsLight)).toBe(true);
    });

    it("skal returnere false når lovvalgsbestemmelse er null", () => {
      const propsLight = {
        lovvalgsbestemmelse: null,
      };

      expect(VurderingPeriodeOffentligAnsattSteg.harAvklaring(propsLight)).toBe(false);
    });

    it("skal returnere false når lovvalgsbestemmelse er undefined", () => {
      const propsLight = {
        lovvalgsbestemmelse: undefined,
      };

      expect(VurderingPeriodeOffentligAnsattSteg.harAvklaring(propsLight)).toBe(false);
    });

    it("skal returnere false når lovvalgsbestemmelse er tom streng", () => {
      const propsLight = {
        lovvalgsbestemmelse: "",
      };

      expect(VurderingPeriodeOffentligAnsattSteg.harAvklaring(propsLight)).toBe(false);
    });
  });

  describe("lovvalgsbestemmelseSomSkalVises mapping", () => {
    it("skal mappe FO_883_2004_ART11_3A til FO_883_2004_ART11_5 for visning", () => {
      const steg = new VurderingPeriodeOffentligAnsattSteg({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      });

      const relevantData = steg.samleRelevanteData({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      });

      expect(relevantData.lovvalgsbestemmelseSomSkalVises).toBe(
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
      );
      expect(relevantData.lovvalgsbestemmelseSomSkalLagres).toBe(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      );
    });

    it("skal ikke mappe FO_883_2004_ART11_3B - skal vises som den er", () => {
      const steg = new VurderingPeriodeOffentligAnsattSteg({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      });

      const relevantData = steg.samleRelevanteData({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      });

      expect(relevantData.lovvalgsbestemmelseSomSkalVises).toBe(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );
      expect(relevantData.lovvalgsbestemmelseSomSkalLagres).toBe(
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal returnere harAvklaring true når lovvalgsbestemmelse er satt", () => {
      const steg = new VurderingPeriodeOffentligAnsattSteg({
        ...mockPropsLight,
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      });

      const relevantUI = steg.beregnRelevantUI({
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      });

      expect(relevantUI.harAvklaring).toBe(true);
    });

    it("skal returnere harAvklaring false når lovvalgsbestemmelse mangler", () => {
      const steg = new VurderingPeriodeOffentligAnsattSteg({
        ...mockPropsLight,
        lovvalgsbestemmelse: null,
      });

      const relevantUI = steg.beregnRelevantUI({
        lovvalgsbestemmelse: null,
      });

      expect(relevantUI.harAvklaring).toBe(false);
    });
  });
});
