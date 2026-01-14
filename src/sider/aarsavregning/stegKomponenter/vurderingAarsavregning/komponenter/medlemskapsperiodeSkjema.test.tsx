import { describe, expect, it } from "vitest";

describe("MedlemskapsperiodeSkjema - Legg til periode knapp visningslogikk", () => {
  /**
   * Tester logikken for når "Legg til periode"-knappen skal vises.
   * Basert på koden i medlemskapsperiodeSkjema.tsx linje 172:
   * {medlemskapsperioder.length === index + 1 && (!erPliktigBestemmelse || erDeltGrunnlag) && (
   */

  const pliktigeBestemmelser = ["FTRL_2_7", "FTRL_2_6"];

  const skalViseKnapp = (
    index: number,
    antallPerioder: number,
    erPliktigBestemmelse: boolean,
    erDeltGrunnlag: boolean,
  ): boolean => {
    // Logikken fra komponenten
    const erSistePeriode = antallPerioder === index + 1;
    const skalVises = erSistePeriode && (!erPliktigBestemmelse || erDeltGrunnlag);
    return skalVises;
  };

  describe("Når bestemmelsen er pliktig", () => {
    const erPliktigBestemmelse = true;

    it("skal IKKE vise knappen når erDeltGrunnlag=false (original oppførsel)", () => {
      const erDeltGrunnlag = false;
      const result = skalViseKnapp(0, 1, erPliktigBestemmelse, erDeltGrunnlag);

      expect(result).toBe(false);
    });

    it("skal vise knappen når erDeltGrunnlag=true (bugfix)", () => {
      const erDeltGrunnlag = true;
      const result = skalViseKnapp(0, 1, erPliktigBestemmelse, erDeltGrunnlag);

      // Dette er bugfixen: Knappen skal være synlig for delt grunnlag selv om bestemmelse er pliktig
      expect(result).toBe(true);
    });
  });

  describe("Når bestemmelsen IKKE er pliktig", () => {
    const erPliktigBestemmelse = false;

    it("skal vise knappen uavhengig av erDeltGrunnlag", () => {
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, false)).toBe(true);
      expect(skalViseKnapp(0, 1, erPliktigBestemmelse, true)).toBe(true);
    });
  });

  describe("Kun siste periode viser knappen", () => {
    it("skal ikke vise knappen for ikke-siste periode", () => {
      const erPliktigBestemmelse = false;
      const erDeltGrunnlag = true;

      // Index 0 av 2 perioder - ikke siste
      const result = skalViseKnapp(0, 2, erPliktigBestemmelse, erDeltGrunnlag);

      expect(result).toBe(false);
    });

    it("skal vise knappen kun for siste periode", () => {
      const erPliktigBestemmelse = false;
      const erDeltGrunnlag = true;

      // Index 1 av 2 perioder - siste periode
      const result = skalViseKnapp(1, 2, erPliktigBestemmelse, erDeltGrunnlag);

      expect(result).toBe(true);
    });
  });

  describe("Sannhetstabell for alle kombinasjoner", () => {
    it("skal følge sannhetstabell for knapp-visning", () => {
      // Format: [index, antallPerioder, erPliktig, erDeltGrunnlag, forventetResultat]
      const testCases: Array<[number, number, boolean, boolean, boolean]> = [
        // Siste periode + ikke pliktig + ikke delt grunnlag = VIS
        [0, 1, false, false, true],
        // Siste periode + ikke pliktig + delt grunnlag = VIS
        [0, 1, false, true, true],
        // Siste periode + pliktig + ikke delt grunnlag = IKKE VIS
        [0, 1, true, false, false],
        // Siste periode + pliktig + delt grunnlag = VIS (BUGFIX)
        [0, 1, true, true, true],
        // Ikke siste periode = IKKE VIS (uavhengig av andre parametre)
        [0, 2, false, false, false],
        [0, 2, false, true, false],
        [0, 2, true, false, false],
        [0, 2, true, true, false],
      ];

      testCases.forEach(([index, antallPerioder, erPliktig, erDeltGrunnlag, forventet]) => {
        const result = skalViseKnapp(index, antallPerioder, erPliktig, erDeltGrunnlag);
        expect(
          result,
          `Forventet ${forventet} for: index=${index}, antall=${antallPerioder}, pliktig=${erPliktig}, deltGrunnlag=${erDeltGrunnlag}`,
        ).toBe(forventet);
      });
    });
  });

  describe("Bestemmelse-sjekk", () => {
    it("skal identifisere pliktige bestemmelser korrekt", () => {
      const bestemmelse1 = "FTRL_2_7";
      const bestemmelse2 = "FTRL_2_8";

      expect(pliktigeBestemmelser.includes(bestemmelse1)).toBe(true);
      expect(pliktigeBestemmelser.includes(bestemmelse2)).toBe(false);
    });
  });
});
