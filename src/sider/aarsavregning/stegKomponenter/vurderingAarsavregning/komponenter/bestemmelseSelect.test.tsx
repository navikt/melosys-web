import { describe, expect, it } from "vitest";
import {
  ULAGRET_MEDLEMSKAPSPERIODE_ID,
  ULAGRET_HELSEUTGIFTDEKKESPERIODE_ID,
  MedlemskapsperiodeFieldProps,
} from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

/**
 * Tester betingelsen for når lagrede perioder skal slettes ved bestemmelsesbytte.
 * Logikken fra bestemmelseSelect.tsx:
 *   avgiftspliktigperioder.some((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
 *
 * Bugfix (MELOSYS-7636): Når bruker endrer bestemmelse etter å ha lagret perioder,
 * skal eksisterende lagrede perioder slettes via API før nye opprettes.
 */
const skalSletteEksisterendePerioder = (perioder: MedlemskapsperiodeFieldProps[]): boolean =>
  perioder.some((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID);

const lagPeriode = (id: number): MedlemskapsperiodeFieldProps => ({
  id,
  type: "MEDLEMSKAPSPERIODE",
  fomDato: "01.01.2025",
  tomDato: "31.12.2025",
  innvilgelsesResultat: "",
  medlemskapstype: "",
  trygdedekning: "",
  bestemmelse: "",
  redigerbar: true,
});

describe("bestemmelseSelect - sletting ved bestemmelsesbytte", () => {
  describe("Når alle perioder er ulagrede FTRL-perioder (id === -1)", () => {
    it("skal IKKE slette eksisterende perioder", () => {
      const perioder = [lagPeriode(ULAGRET_MEDLEMSKAPSPERIODE_ID)];
      expect(skalSletteEksisterendePerioder(perioder)).toBe(false);
    });

    it("skal IKKE slette ved flere ulagrede FTRL-perioder", () => {
      const perioder = [lagPeriode(ULAGRET_MEDLEMSKAPSPERIODE_ID), lagPeriode(ULAGRET_MEDLEMSKAPSPERIODE_ID)];
      expect(skalSletteEksisterendePerioder(perioder)).toBe(false);
    });
  });

  describe("Når det finnes lagrede perioder (positiv ID)", () => {
    it("skal slette når én periode er lagret", () => {
      const perioder = [lagPeriode(42)];
      expect(skalSletteEksisterendePerioder(perioder)).toBe(true);
    });

    it("skal slette når én er lagret og én er ulagret", () => {
      const perioder = [lagPeriode(42), lagPeriode(ULAGRET_MEDLEMSKAPSPERIODE_ID)];
      expect(skalSletteEksisterendePerioder(perioder)).toBe(true);
    });
  });

  describe("Når det finnes ulagrede EØS-helseutgiftperioder (id === -2)", () => {
    it("skal slette siden EØS-perioden har annen ID enn ULAGRET_MEDLEMSKAPSPERIODE_ID", () => {
      const perioder = [lagPeriode(ULAGRET_HELSEUTGIFTDEKKESPERIODE_ID)];
      expect(skalSletteEksisterendePerioder(perioder)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("skal IKKE slette ved tom periodeliste", () => {
      expect(skalSletteEksisterendePerioder([])).toBe(false);
    });
  });
});
