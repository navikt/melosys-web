import { describe, it, expect } from "vitest";
import Stegvelger from "./Stegvelger";
import { STEG } from "./stegMotor";

/**
 * SMOKE TESTS
 *
 * Disse testene er bevisst enkle - de verifiserer bare at komponenten
 * kan importeres og at grunnleggende struktur eksisterer.
 *
 * VIKTIG: Pga tight coupling til Redux er full rendering umulig uten
 * omfattende mocking (150+ linjer). E2E-tester er bedre egnet for
 * funksjonell testing.
 *
 * Etter refaktorering kan vi skrive mer detaljerte enhetstester.
 */
describe("Stegvelger - Smoke Tests", () => {
  it("kan importeres uten feil", () => {
    // Verifiser at module import fungerer
    expect(Stegvelger).toBeDefined();
    expect(typeof Stegvelger).toBe("function"); // Redux connect returnerer en funksjon
  });

  it("STEG enum eksisterer", () => {
    // Verifiser at STEG-konstanter er tilgjengelige
    expect(STEG).toBeDefined();
    expect(STEG.INNGANG).toBeDefined();
    expect(STEG.YRKESAKTIVITET).toBeDefined();
    expect(STEG.VEDTAK).toBeDefined();
  });
});
