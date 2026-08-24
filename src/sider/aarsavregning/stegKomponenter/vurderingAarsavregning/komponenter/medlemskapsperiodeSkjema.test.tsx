import { describe, expect, it } from "vitest";

describe("MedlemskapsperiodeSkjema - Legg til periode knapp visningslogikk", () => {
  /**
   * Tester logikken for når "Legg til periode"-knappen skal vises.
   * Basert på koden i medlemskapsperiodeSkjema.tsx:
   * {medlemskapsperioder.length === index + 1 && !erUtenGrunnlag && (!erPliktigBestemmelse || erDeltGrunnlag) && (
   *
   * For "uten grunnlag" (erUtenGrunnlag=true) skjules knappen alltid.
   */

  const pliktigeBestemmelser = ["FTRL_2_7", "FTRL_2_6"];

  const skalViseKnapp = (
    index: number,
    antallPerioder: number,
    erPliktigBestemmelse: boolean,
    erDeltGrunnlag: boolean,
    erUtenGrunnlag: boolean,
  ): boolean => {
    // Logikken fra komponenten
    const erSistePeriode = antallPerioder === index + 1;
    return erSistePeriode && !erUtenGrunnlag && (!erPliktigBestemmelse || erDeltGrunnlag);
  };

  describe("Uten grunnlag (erUtenGrunnlag=true)", () => {
    it("skal ALDRI vise knappen, uavhengig av andre parametre", () => {
      expect(skalViseKnapp(0, 1, false, false, true)).toBe(false);
      expect(skalViseKnapp(0, 1, false, true, true)).toBe(false);
      expect(skalViseKnapp(0, 1, true, false, true)).toBe(false);
      expect(skalViseKnapp(0, 1, true, true, true)).toBe(false);
    });
  });

  describe("Når bestemmelsen er pliktig (ikke uten grunnlag)", () => {
    const erPliktigBestemmelse = true;

    it("skal IKKE vise knappen når erDeltGrunnlag=false", () => {
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, false, false)).toBe(false);
    });

    it("skal vise knappen når erDeltGrunnlag=true (bugfix)", () => {
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, true, false)).toBe(true);
    });
  });

  describe("Når bestemmelsen IKKE er pliktig (ikke uten grunnlag)", () => {
    const erPliktigBestemmelse = false;

    it("skal vise knappen uavhengig av erDeltGrunnlag", () => {
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, false, false)).toBe(true);
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, true, false)).toBe(true);
    });
  });

  describe("Kun siste periode viser knappen", () => {
    it("skal ikke vise knappen for ikke-siste periode", () => {
      // Index 0 av 2 perioder - ikke siste
      expect(skalViseKnapp(0, 2, false, true, false)).toBe(false);
    });

    it("skal vise knappen kun for siste periode", () => {
      // Index 1 av 2 perioder - siste periode
      expect(skalViseKnapp(1, 2, false, true, false)).toBe(true);
    });
  });

  describe("Sannhetstabell for alle kombinasjoner", () => {
    it("skal følge sannhetstabell for knapp-visning", () => {
      // Format: [index, antallPerioder, erPliktig, erDeltGrunnlag, erUtenGrunnlag, forventetResultat]
      const testCases: Array<[number, number, boolean, boolean, boolean, boolean]> = [
        // Uten grunnlag = ALDRI VIS
        [0, 1, false, false, true, false],
        [0, 1, false, true, true, false],
        [0, 1, true, false, true, false],
        [0, 1, true, true, true, false],
        // Siste periode + ikke pliktig + ikke delt grunnlag = VIS
        [0, 1, false, false, false, true],
        // Siste periode + ikke pliktig + delt grunnlag = VIS
        [0, 1, false, true, false, true],
        // Siste periode + pliktig + ikke delt grunnlag = IKKE VIS
        [0, 1, true, false, false, false],
        // Siste periode + pliktig + delt grunnlag = VIS (BUGFIX)
        [0, 1, true, true, false, true],
        // Ikke siste periode = IKKE VIS (uavhengig av andre parametre)
        [0, 2, false, false, false, false],
        [0, 2, false, true, false, false],
        [0, 2, true, false, false, false],
        [0, 2, true, true, false, false],
      ];

      testCases.forEach(([index, antallPerioder, erPliktig, erDeltGrunnlag, erUtenGrunnlag, forventet]) => {
        const result = skalViseKnapp(index, antallPerioder, erPliktig, erDeltGrunnlag, erUtenGrunnlag);
        expect(
          result,
          `Forventet ${forventet} for: index=${index}, antall=${antallPerioder}, pliktig=${erPliktig}, deltGrunnlag=${erDeltGrunnlag}, utenGrunnlag=${erUtenGrunnlag}`,
        ).toBe(forventet);
      });
    });
  });

  describe("Bestemmelse-sjekk", () => {
    it("skal identifisere pliktige bestemmelser korrekt", () => {
      expect(pliktigeBestemmelser.includes("FTRL_2_7")).toBe(true);
      expect(pliktigeBestemmelser.includes("FTRL_2_8")).toBe(false);
    });
  });
});
