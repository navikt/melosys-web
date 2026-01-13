import { describe, it, expect } from "vitest";
import {
  erMedlemskapsperiode,
  erLovvalgsperiode,
  erHelseutgiftdekkesperiode,
  harInnvilgelsesResultat,
  Medlemskapsperiode,
  Lovvalgsperiode,
  Helseutgiftdekkesperiode,
  Avgiftspliktigperiode,
} from "./periodeTyper";

const lagMedlemskapsperiode = (overrides?: Partial<Medlemskapsperiode>): Medlemskapsperiode => ({
  id: 1,
  type: "MEDLEMSKAPSPERIODE",
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  bestemmelse: "FTRL_KAP2_2_5_FØRSTE_LEDD_A",
  innvilgelsesResultat: "INNVILGET",
  trygdedekning: "FULL_DEKNING_FTRL",
  medlemskapstype: "PLIKTIG",
  ...overrides,
});

const lagLovvalgsperiode = (overrides?: Partial<Lovvalgsperiode>): Lovvalgsperiode => ({
  id: 2,
  type: "LOVVALGSPERIODE",
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  bestemmelse: "ART_11_3_A",
  innvilgelsesResultat: "INNVILGET",
  trygdedekning: "FULL_DEKNING_EØS",
  medlemskapstype: "PLIKTIG",
  ...overrides,
});

const lagHelseutgiftdekkesperiode = (overrides?: Partial<Helseutgiftdekkesperiode>): Helseutgiftdekkesperiode => ({
  id: 3,
  type: "HELSEUTGIFTDEKKESPERIODE",
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  ...overrides,
});

describe("periodeTyper type guards", () => {
  describe("erMedlemskapsperiode", () => {
    it("skal returnere true for Medlemskapsperiode", () => {
      const periode = lagMedlemskapsperiode();
      expect(erMedlemskapsperiode(periode)).toBe(true);
    });

    it("skal returnere false for Lovvalgsperiode", () => {
      const periode = lagLovvalgsperiode();
      expect(erMedlemskapsperiode(periode)).toBe(false);
    });

    it("skal returnere false for Helseutgiftdekkesperiode", () => {
      const periode = lagHelseutgiftdekkesperiode();
      expect(erMedlemskapsperiode(periode)).toBe(false);
    });
  });

  describe("erLovvalgsperiode", () => {
    it("skal returnere true for Lovvalgsperiode", () => {
      const periode = lagLovvalgsperiode();
      expect(erLovvalgsperiode(periode)).toBe(true);
    });

    it("skal returnere false for Medlemskapsperiode", () => {
      const periode = lagMedlemskapsperiode();
      expect(erLovvalgsperiode(periode)).toBe(false);
    });

    it("skal returnere false for Helseutgiftdekkesperiode", () => {
      const periode = lagHelseutgiftdekkesperiode();
      expect(erLovvalgsperiode(periode)).toBe(false);
    });
  });

  describe("erHelseutgiftdekkesperiode", () => {
    it("skal returnere true for Helseutgiftdekkesperiode", () => {
      const periode = lagHelseutgiftdekkesperiode();
      expect(erHelseutgiftdekkesperiode(periode)).toBe(true);
    });

    it("skal returnere false for Medlemskapsperiode", () => {
      const periode = lagMedlemskapsperiode();
      expect(erHelseutgiftdekkesperiode(periode)).toBe(false);
    });

    it("skal returnere false for Lovvalgsperiode", () => {
      const periode = lagLovvalgsperiode();
      expect(erHelseutgiftdekkesperiode(periode)).toBe(false);
    });
  });

  describe("harInnvilgelsesResultat", () => {
    it("skal returnere true for Medlemskapsperiode", () => {
      const periode = lagMedlemskapsperiode();
      expect(harInnvilgelsesResultat(periode)).toBe(true);
    });

    it("skal returnere true for Lovvalgsperiode", () => {
      const periode = lagLovvalgsperiode();
      expect(harInnvilgelsesResultat(periode)).toBe(true);
    });

    it("skal returnere false for Helseutgiftdekkesperiode", () => {
      const periode = lagHelseutgiftdekkesperiode();
      expect(harInnvilgelsesResultat(periode)).toBe(false);
    });

    it("skal gi tilgang til innvilgelsesResultat etter type narrowing", () => {
      const perioder: Avgiftspliktigperiode[] = [
        lagMedlemskapsperiode({ innvilgelsesResultat: "INNVILGET" }),
        lagLovvalgsperiode({ innvilgelsesResultat: "DELVIS_INNVILGET" }),
        lagHelseutgiftdekkesperiode(),
      ];

      const resultater = perioder.filter(harInnvilgelsesResultat).map((periode) => periode.innvilgelsesResultat);

      expect(resultater).toEqual(["INNVILGET", "DELVIS_INNVILGET"]);
    });
  });
});
